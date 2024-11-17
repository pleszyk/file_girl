const { STS } = require("@aws-sdk/client-sts");
const { AssumeRoleCommand } = require("@aws-sdk/client-sts");

async function sessionToken(user) {
  const stsClient = new STS({ region: "us-east-2" });

  const policy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:CreateMultipartUpload",
                "s3:UploadPart"
            ],
            "Resource": [
                "arn:aws:s3:::filegirl/${user}/*"
            ]
        }
    ]
}`;

  try {
    // Returns a set of temporary security credentials that you can use to
    // access Amazon Web Services resources that you might not normally
    // have access to.
    const command = new AssumeRoleCommand({
      // The Amazon Resource Name (ARN) of the role to assume.
      RoleArn: "arn:aws:iam::478071003839:role/filegirl-role",
      // An identifier for the assumed role session.
      RoleSessionName: "session1",
      // The duration, in seconds, of the role session. The value specified
      // can range from 900 seconds (15 minutes) up to the maximum session
      // duration set for the role.
      Policy: policy,
      DurationSeconds: 900,
    });
    const response = await stsClient.send(command);
    return response.Credentials;
  } catch (err) {
    console.error(err);
  }
}

module.exports = { sessionToken };
