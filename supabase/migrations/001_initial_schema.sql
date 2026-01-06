-- DezApp Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable pgvector extension for AI search
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations (synced from Clerk)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization memberships
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Folders (for organizing files and notes)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  note_id UUID, -- Will be linked after notes table is created
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from files to notes
ALTER TABLE files ADD CONSTRAINT fk_files_note
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL;

-- Emails
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[] DEFAULT '{}',
  bcc_addresses TEXT[] DEFAULT '{}',
  subject TEXT NOT NULL,
  body JSONB DEFAULT '{}',
  body_html TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body JSONB DEFAULT '{}',
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_files_org ON files(org_id);
CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_notes_org ON notes(org_id);
CREATE INDEX idx_notes_folder ON notes(folder_id);
CREATE INDEX idx_notes_author ON notes(author_id);
CREATE INDEX idx_emails_org ON emails(org_id);
CREATE INDEX idx_emails_sender ON emails(sender_id);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_org_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  content jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    notes.id,
    notes.title,
    notes.content,
    1 - (notes.embedding <=> query_embedding) AS similarity
  FROM notes
  WHERE notes.org_id = p_org_id
    AND notes.embedding IS NOT NULL
    AND 1 - (notes.embedding <=> query_embedding) > match_threshold
  ORDER BY notes.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be added based on Clerk JWT claims
-- For now, we'll use service role key for webhook operations
-- and implement proper RLS in production

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to notes
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
