# Gmail Integration Workflow

## Project Overview
Integrate Gmail into our TISA LMS app to handle all email communication directly within the application. Users will never need to login to Gmail separately - everything happens in our unified interface.

## Core Features
- **Unified Inbox**: All connected Gmail accounts in one main tab
- **Smart Organization**: AI-powered and manual email labeling system
- **Custom Tabs**: Sorted emails by labels/categories 
- **AI Integration**: Generate replies, summarization, auto-categorization
- **Multi-Account Support**: Connect all TK Gmail accounts
- **Send & Reply**: Full email composition and sending capabilities

## Technical Architecture
- **Frontend**: React components integrated into existing TISA LMS
- **Backend**: Supabase Edge Functions for Gmail API calls
- **Database**: Postgres with RLS for email storage and organization
- **Authentication**: Gmail OAuth + existing Supabase auth system
- **Real-time**: Supabase subscriptions for live email updates
- **AI**: OpenAI integration for smart features

## Implementation Phases

### Phase 1: Foundation & Single Account (Week 1-2)
**Goal**: Basic email reading and UI foundation

**Tasks**:
1. **Setup Gmail API Project**
   - Create Google Cloud Project with Gmail API enabled
   - Configure OAuth consent screen for internal use
   - Add secrets to Supabase: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`

2. **Database Schema**
   ```sql
   -- Gmail accounts table
   CREATE TABLE gmail_accounts (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users,
     email_address text NOT NULL,
     access_token text NOT NULL,
     refresh_token text NOT NULL,
     expires_at timestamp,
     created_at timestamp DEFAULT now(),
     is_active boolean DEFAULT true
   );

   -- Emails table
   CREATE TABLE emails (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     gmail_account_id uuid REFERENCES gmail_accounts,
     gmail_message_id text NOT NULL,
     thread_id text,
     subject text,
     sender_email text,
     sender_name text,
     recipient_emails text[],
     body_text text,
     body_html text,
     snippet text,
     is_read boolean DEFAULT false,
     is_archived boolean DEFAULT false,
     received_at timestamp,
     created_at timestamp DEFAULT now()
   );

   -- Custom email labels
   CREATE TABLE email_labels (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text NOT NULL,
     color text DEFAULT '#3b82f6',
     user_id uuid REFERENCES auth.users,
     created_at timestamp DEFAULT now()
   );

   -- Email-label relationships
   CREATE TABLE email_label_assignments (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     email_id uuid REFERENCES emails,
     label_id uuid REFERENCES email_labels,
     assigned_at timestamp DEFAULT now(),
     assigned_by_ai boolean DEFAULT false
   );
   ```

3. **Basic Email Reading**
   - Create Supabase Edge Function: `gmail-oauth`
   - Create Supabase Edge Function: `gmail-sync`
   - Implement OAuth flow for connecting Gmail accounts
   - Build email polling system (every 2-3 minutes initially)
   - Store emails in database with metadata

4. **Initial UI Components**
   - Add "Email" to navigation menu (Mail icon)
   - Create `/pages/Email.tsx` with main email interface
   - Basic email list view (inbox style)
   - Email detail view for reading full messages
   - Account connection UI

### Phase 2: Core Functionality (Week 3-4)
**Goal**: Complete email management and organization

**Tasks**:
1. **Email Organization**
   - Custom label creation and management
   - Manual label assignment UI (drag & drop or quick actions)
   - Email filtering by labels, sender, date range
   - Advanced search functionality
   - Mark as read/unread, archive actions

2. **Email Composition & Sending**
   - Compose new email modal/page
   - Reply and Reply-All functionality  
   - Forward emails with original content
   - Rich text editor for email composition
   - Send emails via Gmail API using correct account
   - Draft saving and management

3. **Multi-Account Support**
   - Connect multiple TK Gmail accounts
   - Account switcher in UI header
   - Proper data isolation between accounts
   - Account management settings page
   - Unified inbox view across accounts

### Phase 3: Intelligence & Automation (Week 5-6)
**Goal**: AI-powered features and advanced functionality

**Tasks**:
1. **AI-Powered Features**
   - Auto-categorization using OpenAI (analyze subject/content)
   - Smart reply suggestions (3-5 quick responses)
   - Email summarization for long messages/threads
   - Automatic label assignment based on content patterns
   - Sentiment analysis for priority handling

2. **Advanced UI Features**
   - Real-time email updates (Supabase realtime subscriptions)
   - Email threads and conversation view
   - Attachment handling and preview
   - Email templates and saved signatures
   - Keyboard shortcuts for power users
   - Email scheduling (send later)

3. **Analytics & Insights**
   - Email volume analytics per account
   - Response time tracking
   - Most active contacts/domains
   - Label usage statistics

### Phase 4: Optimization & Polish (Week 7-8)
**Goal**: Production-ready with real-time updates

**Tasks**:
1. **Real-time Updates**
   - Implement Gmail Push Notifications via Google Cloud Pub/Sub
   - Create webhook endpoint in Supabase Edge Function
   - Replace polling with webhook-based instant updates
   - Handle webhook reliability and fallback polling

2. **Performance & UX**
   - Email content caching and lazy loading
   - Full-text search with PostgreSQL indexing
   - Batch operations (bulk archive, label, delete)
   - Mobile-responsive email interface
   - Offline email reading capability

3. **Integration with Existing TISA System**
   - Link emails to staff profiles and contracts
   - Email activity in staff timelines
   - Contract-related email filtering and organization
   - Automated review reminder emails
   - Email insights in dashboard analytics

## Database Schema Details

### Tables & Relationships
- `gmail_accounts` → Stores OAuth tokens per connected account
- `emails` → Core email storage with Gmail metadata
- `email_labels` → Custom user-defined labels/categories
- `email_label_assignments` → Many-to-many email ↔ label relationships

### Row Level Security (RLS)
- All tables filtered by `user_id` or related account ownership
- Managers can access team emails if configured
- Admin role has access to all organizational emails

## API Endpoints (Supabase Edge Functions)

### Authentication & Setup
- `POST /gmail-oauth` - Initiate OAuth flow
- `POST /gmail-callback` - Handle OAuth callback
- `DELETE /gmail-disconnect` - Remove account connection

### Email Operations  
- `GET /gmail-sync` - Manual sync trigger
- `POST /gmail-send` - Send new email
- `POST /gmail-reply` - Reply to email
- `PUT /gmail-labels` - Update email labels
- `PUT /gmail-read-status` - Mark read/unread

### AI Features
- `POST /email-categorize` - AI auto-categorization
- `POST /email-reply-suggestions` - Generate smart replies
- `POST /email-summarize` - Summarize long emails/threads

## Security Considerations

### OAuth & Tokens
- Store refresh tokens encrypted in database
- Implement automatic token refresh before expiration
- Secure token storage with Supabase Vault if needed
- Scope limiting to only required Gmail permissions

### Data Privacy
- Comply with GDPR for email content storage
- Option to store minimal metadata only
- User consent for AI processing of email content
- Data retention policies for archived emails

### Access Control
- RLS policies prevent cross-user data access
- Manager permissions for team email monitoring
- Audit logging for sensitive operations
- Rate limiting on API endpoints

## Monitoring & Maintenance

### Logging & Analytics
- Track API usage and quotas
- Monitor OAuth token refresh success/failures
- Log email sync performance and errors
- User engagement analytics

### Error Handling
- Gmail API quota management
- Network timeout handling
- Token expiration recovery
- Webhook delivery failure fallbacks

## Success Metrics
- **Adoption**: % of TK staff using integrated email vs Gmail directly
- **Efficiency**: Average time saved per email interaction
- **Organization**: % of emails auto-categorized successfully
- **Response Time**: Improvement in email response times
- **User Satisfaction**: Feedback scores on email workflow integration

## Future Enhancements (Post-MVP)
- Calendar integration for meeting scheduling
- Email templates library
- Advanced email rules and automation
- Integration with other productivity tools
- Email analytics dashboard
- Mobile app for email access
- Voice-to-email transcription
- Email-to-task conversion for project management

---

## Development Notes
- Start with single account proof-of-concept
- Use existing TISA design system and components
- Leverage Supabase real-time for live updates
- Implement comprehensive error handling
- Focus on user experience and workflow efficiency
- Plan for scalability from day one