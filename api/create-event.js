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
    const { event, eventHtml, pageName } = req.body;

    if (!event || !eventHtml || !pageName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Get current events.json
    let currentEvents = [];
    let eventsSha = null;

    try {
      const eventsResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/events.json?ref=${BRANCH}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        eventsSha = eventsData.sha;
        const content = Buffer.from(eventsData.content, 'base64').toString('utf8');
        currentEvents = JSON.parse(content);
      }
    } catch (e) {
      console.log('events.json does not exist yet, creating new one');
    }

    // 2. Add new event
    currentEvents.push(event);

    // 3. Commit events.json
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
          message: `Add event: ${event.title}`,
          content: Buffer.from(JSON.stringify(currentEvents, null, 2)).toString('base64'),
          branch: BRANCH,
          ...(eventsSha && { sha: eventsSha })
        })
      }
    );

    if (!eventsCommitResponse.ok) {
      const error = await eventsCommitResponse.json();
      throw new Error(`Failed to update events.json: ${JSON.stringify(error)}`);
    }

    // 4. Commit HTML file
    const htmlCommitResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pageName}.html`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add event page: ${pageName}.html`,
          content: Buffer.from(eventHtml).toString('base64'),
          branch: BRANCH
        })
      }
    );

    if (!htmlCommitResponse.ok) {
      const error = await htmlCommitResponse.json();
      throw new Error(`Failed to create ${pageName}.html: ${JSON.stringify(error)}`);
    }

    return res.status(200).json({
      success: true,
      message: `Event "${event.title}" created successfully!`
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
