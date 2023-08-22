const { App } = require("@slack/bolt");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "tokens.json";
var user_id;

// Remix this project and add your own Slack app credentials to the environment
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: "DEBUG",
});

app.command("/win-flash", async ({ command, payload, context, ack }) => {
  /* Acknowledge command request */
  ack();

  /* user_id of the person who triggered the slash command */
  const commandUser = command.user_id;
  user_id = commandUser;

  try {
    const result = await app.client.views.open({
      /* Retrieve botToken from the context option */
      token: context.botToken,
      /* Pass a valid trigger_id within 3 seconds */
      trigger_id: payload.trigger_id,
      /* View payload for the modal */
      view: {
        type: "modal",
        /* Identifier for the modal. You'll use this with the view() method */
        callback_id: "win_modal",
        /* Title for the modal itself */
        title: {
          type: "plain_text",
          text: "Win Flash",
        },
        /* Submit button - needed if your modal has any input blocks */
        submit: {
          type: "plain_text",
          text: "Submit Me!",
        },
        /* Close button - optional */
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: *Hey <@${commandUser}>*\n\n_This is a form to submit a Win Flash_`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            block_id: "users_select_block",
            label: {
              type: "plain_text",
              text: "Who are you?",
            },
            element: {
              type: "users_select",
              action_id: "users_select_value",
              placeholder: {
                type: "plain_text",
                text: "Go ahead...",
              },
            },
          },
          {
            type: "input",
            block_id: "plain_text_input_block",
            label: {
              type: "plain_text",
              text: "Salesforce Opportunity Link",
            },
            element: {
              type: "plain_text_input",
              action_id: "plain_text_input_value",
            },
            hint: {
              type: "plain_text",
              text: "This must be a URL that goes directly to the opportunity in SF to work.",
            },
          },
          {
            type: "section",
            block_id: "multi_users_block",
            text: {
              type: "plain_text",
              text: "Pick all who helped win.",
            },
            accessory: {
              action_id: "multi_users",
              type: "multi_users_select",
              placeholder: {
                type: "plain_text",
                text: "Select users",
              },
            },
          },
          {
            type: "input",
            block_id: "multiline_input_block",
            label: {
              type: "plain_text",
              text: "Please Describe the Win.",
            },
            element: {
              type: "plain_text_input",
              action_id: "multiline_input_value",
              multiline: true,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

app.view("win_modal", ({ ack, view }) => {
  /* This is a really basic ack() - you can also use response_actions https://api.slack.com/surfaces/modals/using#response_actions */
  ack();

  /* Input values stored inside of view['state']['values'] */
  const inputValues = view["state"]["values"];

  //Uncomment the line below to print the input values
  console.log(inputValues);

  /* If you want to convert the user_id to a username, call the users.info method! https://api.slack.com/methods/users.info */
  const usersInputValue =
    inputValues["users_select_block"]["users_select_value"]["selected_user"];
  const winUsersInputValue =
    inputValues["multi_users_block"]["multi_users"]["selected_users"];
  const plainInputValue =
    inputValues["plain_text_input_block"]["plain_text_input_value"]["value"];
  const multiLineInputValue =
    inputValues["multiline_input_block"]["multiline_input_value"]["value"];

  console.log(winUsersInputValue);

  /* var winString = "";
  winUsersInputValue.forEach(myFunction);
  function myFunction(item, index) {
    winString += item["value"];
  } */

  /* just print these to check ourselves */
  console.log(
    `${usersInputValue}\nPlain input value: ${plainInputValue}\nWinners Input Value: ${winUsersInputValue}\nMultiline input value: ${multiLineInputValue}`
  );

  /* Calls the method below to update the Google Sheet */
  updateSpreadsheet(
    oAuth2Client,
    usersInputValue,
    winUsersInputValue,
    plainInputValue,
    multiLineInputValue
  );
});

/* API documentation for updating and modifying google sheets - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values */

/* When you create a google app at https://developers.google.com/sheets/api/quickstart/nodejs, 
it'll give you a credentials.json file that you'll import into Glitch */
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  /* Authorize a client with credentials, then call the Google Sheets API */
  authorize(JSON.parse(content), updateSpreadsheet);
});

let oAuth2Client;

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  /* Check if we have previously stored a token. */
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  oAuth2Client.getToken(process.env.GOOGLE_SPREADSHEET_TOKEN, (err, token) => {
    if (err)
      return console.error("Error while trying to retrieve access token", err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log("Token stored to", TOKEN_PATH);
    });
  });
}

/* Updates the external spreadsheet by creating a new row with the passed params */
function updateSpreadsheet(auth, param1, param2, param3, param4) {
  console.log(param2);

  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.append(
    {
      /* Set this up in your .env file - the spreadsheet ID is located in the URL of the spreadsheet */
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      /* Sheet you want to add row to */
      range: "Sheet1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [[param1, param2.toString(), param3, param4]],
      },
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const rows = res.data.values;
    }
  );
}

// Start your Bolt app
(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
