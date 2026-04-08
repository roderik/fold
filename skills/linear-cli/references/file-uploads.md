## File Uploads and Attachments

Upload images, videos, and other files to Linear issues and embed them in comments.

### Contents

- [Attaching Files to Issues](#attaching-files-to-issues)
- [Attaching Files to Comments](#attaching-files-to-comments)
- [Supported File Types](#supported-file-types)
- [Retrieving Attachment URLs](#retrieving-attachment-urls)
- [Evidence Workflow](#evidence-workflow)

### Attaching Files to Issues

```bash
# Basic attachment
linear issue attach PRD-123 ./screenshot.png

# With custom title (shows in Linear's attachment list)
linear issue attach PRD-123 ./recording.webm --title "Login flow recording"

# With a comment linked to the attachment
linear issue attach PRD-123 ./error-screenshot.png \
  --title "Bug reproduction" \
  --comment "This screenshot shows the error state after clicking Submit"
```

The `--title` flag sets the display name in Linear's attachment panel. Without it,
Linear uses the filename.

The `--comment` flag creates a comment on the issue that references the attachment.
The attached file renders inline in the comment.

### Attaching Files to Comments

```bash
# Comment with a single attachment
linear issue comment add PRD-123 \
  --body "Evidence of the login flow working" \
  --attach ./login-success.png

# Comment with multiple attachments
linear issue comment add PRD-123 \
  --body-file /tmp/evidence.md \
  --attach ./step-01.png \
  --attach ./step-02.png \
  --attach ./recording.webm

# Reply to a comment with an attachment
linear issue comment add PRD-123 \
  --parent <comment-id> \
  --body "Updated screenshot after fix" \
  --attach ./fixed-state.png
```

The `--attach` flag can be repeated to attach multiple files. Attached images render
inline within the comment in Linear's UI.

### Bulk Upload Pattern

For uploading an entire evidence directory:

```bash
# Attach all screenshots
for file in ./evidence/step-*.png; do
  title=$(basename "$file" .png | sed 's/step-[0-9]*-//' | tr '-' ' ')
  linear issue attach PRD-123 "$file" --title "Screenshot: $title"
done

# Attach video recording
linear issue attach PRD-123 ./evidence/flow-recording.webm \
  --title "Evidence: Full recording"
```

### Supported File Types

Linear accepts most common file types:

| Category | Extensions | Notes |
|----------|-----------|-------|
| **Images** | `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp` | Render inline in comments |
| **Videos** | `.webm`, `.mp4`, `.mov` | Playable in Linear's viewer |
| **Documents** | `.pdf`, `.doc`, `.docx` | Downloadable |
| **Archives** | `.zip`, `.tar.gz` | Downloadable |
| **Other** | Any file type | Downloadable |

Images and videos get the best treatment — they render inline or are playable
directly in Linear without downloading.

### Retrieving Attachment URLs

After uploading, get the attachment URLs via the GraphQL API:

```bash
# Get all attachments for an issue
ISSUE_ID=$(linear issue view PRD-123 --json | jq -r '.id')
linear api --variable issueId="$ISSUE_ID" <<'GRAPHQL'
query($issueId: String!) {
  issue(id: $issueId) {
    attachments {
      nodes {
        id
        title
        url
        createdAt
      }
    }
  }
}
GRAPHQL
```

**URL characteristics:**
- Linear uses signed S3 URLs for uploaded files
- URLs are publicly accessible (no auth required to view)
- URLs rotate/expire periodically — for permanent links, use the Linear ticket URL
- Images from these URLs can be embedded in GitHub markdown: `![alt](url)`

### Evidence Workflow

The complete pattern for capturing and uploading evidence:

```bash
# 1. Capture evidence
EVIDENCE_DIR="./evidence/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EVIDENCE_DIR"
# ... screenshots and recordings ...

# 2. Upload to Linear
linear issue attach PRD-123 "$EVIDENCE_DIR/recording.webm" \
  --title "Evidence: Flow recording"

for screenshot in "$EVIDENCE_DIR"/step-*.png; do
  linear issue attach PRD-123 "$screenshot"
done

# 3. Create summary comment
linear issue comment add PRD-123 \
  --body-file /tmp/evidence-summary.md \
  --attach "$EVIDENCE_DIR/step-final.png"
```

For the full evidence capture and distribution workflow, see the `evidence` skill.
