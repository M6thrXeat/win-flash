# Using Bolt + Google Sheets

Hopefully you've remixed the `slack-google-sheets` project already. If not, [remix by clicking here](https://glitch.com/edit/#!/remix/slack-google-sheets)

## Setting up the Slack app
[Create a new Slack app](https://api.slack.com/apps).

Some of this information can be found in the [Shopify hackathon slides](https://docs.google.com/presentation/d/1ajoxRi_-mPs56cGPorp0ScaILxzuvEMA6rjdQkffsMM/edit?usp=sharing)

- Add a **Bot User** in the sidebar
- Navigate to **OAuth & Permissions** and add the `users:read` scope
- Install the app by clicking **Install App** in the sidebar
- Set up Interactive Components by clicking **Interactive Components** on the sidebar and add your Glitch request URL: `https://YOUR-PROJECT.glitch.me/slack/events`
- Add a Slash command (or a message action) to your Slack app
  * To add a slash command, click **Slash Commands** on the App Configuration sidebar. Configure the slash command and add your glitch request URL: `https://YOUR-PROJECT.glitch.me/slack/events`


#### Once the app is installed, you'll be presented with a Bot OAuth Access token
- Copy your bot access token and paste it in your `.env` file after `SLACK_BOT_TOKEN`
- Navigate to **Basic Information**, scroll down, and copy **Signing Secret**
- Paste your signing secrete into your `.env` file after `SLACK_SIGNING_SECRET`

## Setting up the Google Sheets Integration 
[Set up a Sheets Integration](https://developers.google.com/sheets/api/quickstart/nodejs) by clicking on Enable the Google Sheets API 
- Click on Download Configuration and save this file locally 
- In glitch, click on `New File` at the top of the sidebar, then select `Upload a File ⬆️`. Select the `configurations.json` file that was saved locally. 

## Creating a Google Sheet 
- Navigate to [sheets.google.com](sheets.google.com) and create a new Google Sheet if you don't have one already. 
- Copy the Sheet Id from the URL. For example if your URL is https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0, your sheet Id will be `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`.
- Paste this Sheet Id in your .env file under `GOOGLE_SPREADSHEET_ID`

### Authorize your Google Sheet app
First open the Glitch console by clicking `Tools` at the bottom of the left sidebar and selecting `Logs 📰`.

- The first time your app runs, you will see `Authorize this app by visiting this url` in the Glitch console, followed by a URL. **Copy this URL and paste it in a browser**. 
- Go through the authorization flow, selecting the Google Account you would like to authorize. *Go through this authorization flow using the same Google Account that you use to create your Google Sheet.* 
- At the end of the process, you'll see a screen that says "Please copy this code, switch to your application and paste it there:". Copy this code and paste it in the .env file under `GOOGLE_SPREADSHEET_TOKEN`


#### Helpful Links
- Create a Slack app: [api.slack.com/apps](https://api.slack.com/apps)
- Documentation: [api.slack.com](https://api.slack.com/start)
- Block Kit Builder: [api.slack.com/block-kit-builder](https://api.slack.com/block-kit-builder)
- Google Sheets API quickstart: [https://developers.google.com/sheets/api/quickstart/nodejs](https://developers.google.com/sheets/api/quickstart/nodejs)
- Documentation on updating spreadsheets with the API: [https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values)
