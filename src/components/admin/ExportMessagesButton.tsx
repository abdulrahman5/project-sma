// Shown above the Inbox list: downloads every message as a CSV file (opens in Excel / Google Sheets).
export function ExportMessagesButton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      <a className="btn btn--style-secondary btn--size-small" href="/api/messages/export-csv" style={{ margin: 0 }}>
        Download all as CSV
      </a>
    </div>
  )
}
