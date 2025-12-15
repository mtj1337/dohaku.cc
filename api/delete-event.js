export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'mtj1337';
  const REPO_NAME = 'dohaku.cc';
  const BRANCH = 'main';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const { eventIndex, pageName } = req.body;

    if (eventIndex === undefined) {
      return res.status(400).json({ error: 'Missing eventIndex' });
    }

    // 1. Get current events.json
    const eventsResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/events.json?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!eventsResponse.ok) {
      throw new Error('Failed to fetch events.json');
    }

    const eventsData = await eventsResponse.json();
    const eventsSha = eventsData.sha;
    const content = Buffer.from(eventsData.content, 'base64').toString('utf8');
    let currentEvents = JSON.parse(content);

    // 2. Remove event from array
    if (eventIndex < 0 || eventIndex >= currentEvents.length) {
      return res.status(400).json({ error: 'Invalid event index' });
    }

    const removedEvent = currentEvents.splice(eventIndex, 1)[0];

    // 3. Commit updated events.json
    const eventsCommitResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/events.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Delete event: ${removedEvent.title}`,
          content: Buffer.from(JSON.stringify(currentEvents, null, 2)).toString('base64'),
          branch: BRANCH,
          sha: eventsSha
        })
      }
    );

    if (!eventsCommitResponse.ok) {
      const error = await eventsCommitResponse.json();
      throw new Error(`Failed to update events.json: ${JSON.stringify(error)}`);
    }

    // 4. Optionally delete HTML file
    if (pageName) {
      try {
        // Get file SHA first
        const fileResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pageName}.html?ref=${BRANCH}`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (fileResponse.ok) {
          const fileData = await fileResponse.json();

          await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pageName}.html`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `Delete event page: ${pageName}.html`,
                sha: fileData.sha,
                branch: BRANCH
              })
            }
          );
        }
      } catch (e) {
        console.log(`Could not delete ${pageName}.html:`, e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Event deleted successfully!`
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
