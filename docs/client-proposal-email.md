# Client proposal email from the lead database

The lead database shows a Corporate email column and an Email action. Clicking
**Email** opens the default email app with the preferred recipient filled in;
clicking an address opens that specific recipient. **Send proposal via CRM**
opens the proposal composer with the supplied PDF attached. Corporate
email is preferred, followed by company and personal emails. Annotations are
removed and duplicate recipient addresses are listed once. The user reviews
the recipient, subject and message before sending. Each email attaches the
supplied two-page client proposal PDF.

The composer loads the approved WhatsApp `client_proposal` template when Meta
is configured and reachable, preferring English. It replaces positional
variables 1, 2 and 3 with the three supplied links. Other placeholders must be
filled before sending. If the template cannot be loaded, it shows an editable,
labeled draft drawn from the proposal PDF.

## Configure the existing EmailJS service

Create a new **Client proposal** template in your existing EmailJS account.
The CRM reuses the contact form's service and public key with its own template ID.

| Template field | Value |
| --- | --- |
| To Email | `{{to_email}}` |
| Subject | `{{subject}}` |
| From Name | Adamant Technologies |
| From Email | Default address of the connected service |
| Reply To | `{{reply_to}}` |

Use this HTML in the template's code editor:

```html
<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#182220;white-space:pre-line;">{{message}}</div>
```

In the template's **Attachments** tab, add:

| Setting | Value |
| --- | --- |
| Attachment type | Variable Attachment |
| Parameter name | `proposal_pdf` |
| Filename | `{{attachment_name}}` |
| Content type | `application/pdf` |

The CRM supplies the PDF as a Base64 data URL. Attachments must be available
within your EmailJS subscription limits. See the official
[file attachment guide](https://www.emailjs.com/docs/user-guide/file-attachments/).

In **EmailJS Account → Security**, enable API requests for non-browser
applications, as described in the official
[Node SDK guidance](https://github.com/emailjs-com/emailjs-nodejs/blob/main/README.md).
The authenticated CRM endpoint sends through the
[EmailJS REST API](https://www.emailjs.com/docs/rest-api/send/). If your account
requires a private key for server calls, add it privately to Vercel.

## Configure production and deploy

Add this Vercel **Production** variable:

```dotenv
EMAILJS_PROPOSAL_TEMPLATE_ID=YOUR_NEW_PROPOSAL_TEMPLATE_ID
```

The existing `NEXT_PUBLIC_EMAILJS_SERVICE_ID` and
`NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` are reused. Optional server settings:

```dotenv
EMAILJS_PRIVATE_KEY=YOUR_PRIVATE_KEY_IF_REQUIRED
EMAILJS_PROPOSAL_REPLY_TO=admin@theadamant.com
```

The private key has no `NEXT_PUBLIC_` prefix. `EMAILJS_SERVICE_ID` and
`EMAILJS_PUBLIC_KEY` can override the existing values for server proposal sends.

Run `supabase/migrations/20260913210000_add_prospect_email_outreach.sql` in
Supabase SQL Editor. It allows the existing outreach table to record emails
alongside WhatsApp. Permissions and source lead IDs are reused.

Deploy the website changes, including
`private-assets/Adamant_Technologies_Client_Proposal.pdf`. Next.js explicitly
includes the private PDF in the proposal endpoint's deployment. Previewing it
requires CRM authentication and lead-database access.

Open a lead's **Send proposal via CRM** action, select its recipient address, review the content
and PDF, then choose **Send proposal**. Sending is disabled until the proposal
template ID and public key are configured.

An accepted send updates outreach to `sent`; this is not a delivery/read
receipt. Provider failures update it to `failed`. If the send succeeds but the
audit update fails, the UI reports that it was sent and warns against a duplicate
retry. To replace the default PDF later, replace the private asset and redeploy.

No real proposal emails or EmailJS account changes were made during local
implementation and testing.
