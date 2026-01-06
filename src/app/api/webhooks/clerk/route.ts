import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type UsersTable = Database['public']['Tables']['users'];
type OrganizationsTable = Database['public']['Tables']['organizations'];
type OrgMembersTable = Database['public']['Tables']['org_members'];

// Admin client for webhook operations (bypasses RLS)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
        } = evt.data;
        const email = email_addresses[0]?.email_address || '';
        const name =
          [first_name, last_name].filter(Boolean).join(' ') || null;

        const userData: UsersTable['Insert'] = {
          clerk_user_id: id,
          email,
          name,
          avatar_url: image_url || null,
        };

        const { error } = await supabase
          .schema('public')
          .from('users')
          .upsert(userData, {
            onConflict: 'clerk_user_id',
          });

        if (error) {
          console.error('Error upserting user:', error);
          return new Response('Error syncing user', { status: 500 });
        }
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;
        if (id) {
          const { error } = await supabase
            .schema('public')
            .from('users')
            .delete()
            .eq('clerk_user_id', id);

          if (error) {
            console.error('Error deleting user:', error);
          }
        }
        break;
      }

      case 'organization.created':
      case 'organization.updated': {
        const { id, name, slug, image_url } = evt.data;

        const orgData: OrganizationsTable['Insert'] = {
          clerk_org_id: id,
          name: name || '',
          slug: slug || '',
          logo_url: image_url || null,
        };

        const { error } = await supabase
          .schema('public')
          .from('organizations')
          .upsert(orgData, {
            onConflict: 'clerk_org_id',
          });

        if (error) {
          console.error('Error upserting organization:', error);
          return new Response('Error syncing organization', {
            status: 500,
          });
        }
        break;
      }

      case 'organization.deleted': {
        const { id } = evt.data;
        if (id) {
          const { error } = await supabase
            .schema('public')
            .from('organizations')
            .delete()
            .eq('clerk_org_id', id);

          if (error) {
            console.error('Error deleting organization:', error);
          }
        }
        break;
      }

      case 'organizationMembership.created': {
        const { organization, public_user_data, role } = evt.data;

        // Get user and org IDs from Supabase
        const { data: user } = await supabase
          .schema('public')
          .from('users')
          .select('id')
          .eq('clerk_user_id', public_user_data.user_id)
          .single();

        const { data: org } = await supabase
          .schema('public')
          .from('organizations')
          .select('id')
          .eq('clerk_org_id', organization.id)
          .single();

        if (user && org) {
          const memberData: OrgMembersTable['Insert'] = {
            org_id: org.id,
            user_id: user.id,
            role: role === 'org:admin' ? 'admin' : 'member',
          };

          const { error } = await supabase
            .schema('public')
            .from('org_members')
            .upsert(memberData, {
              onConflict: 'org_id,user_id',
            });

          if (error) {
            console.error('Error adding org member:', error);
          }
        }
        break;
      }

      case 'organizationMembership.deleted': {
        const { organization, public_user_data } = evt.data;

        const { data: user } = await supabase
          .schema('public')
          .from('users')
          .select('id')
          .eq('clerk_user_id', public_user_data.user_id)
          .single();

        const { data: org } = await supabase
          .schema('public')
          .from('organizations')
          .select('id')
          .eq('clerk_org_id', organization.id)
          .single();

        if (user && org) {
          const { error } = await supabase
            .schema('public')
            .from('org_members')
            .delete()
            .eq('org_id', org.id)
            .eq('user_id', user.id);

          if (error) {
            console.error('Error removing org member:', error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
