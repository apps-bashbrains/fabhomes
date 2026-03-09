# Amazon Pinpoint OTP Setup

Use Amazon Pinpoint to send OTP SMS in production. The app uses **transactional SMS** via the Pinpoint API.

---

## 1. Create a Pinpoint project

1. In **AWS Console**, open **Amazon Pinpoint** (search "Pinpoint").
2. **Create a project** (or use an existing one).
3. **Project name:** e.g. `fabhomes-otp`.
4. Note the **Project ID** (e.g. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4`) — this is your **PINPOINT_APPLICATION_ID**.

---

## 2. Enable the SMS channel

1. In the Pinpoint project, go to **Settings** → **SMS and voice**.
2. Under **SMS**, click **Configure** or **Enable SMS**.
3. Choose **Transactional** (for OTP and one-off messages).
4. **Destination country:** India (or your target country). Pinpoint will show requirements (e.g. registration, sender ID).
5. If the account is in **sandbox**, you can only send to verified destination numbers. For production, complete the steps below.

---

## 3. Request production access (India / other countries)

- **India:** You need to register for **promotional** or **transactional** SMS. In Pinpoint (or SNS) console, go to **Account settings** → **Text messaging (SMS)** and complete **Request production access**. Provide business details and use case (e.g. “OTP for user login and admin login”).
- **Other countries:** Follow the same path for your destination country; some allow low-volume transactional SMS without registration.

Until production is approved, use **sandbox** and add test destination numbers in Pinpoint so OTP works for those numbers only.

---

## 4. Origination identity (sender)

- **Sender ID (India):** For transactional SMS in India you can use a **6-character alphanumeric Sender ID** (e.g. `FABHOM`) after registration. Set it in Pinpoint under **SMS and voice** → **Origination identities** (or use the default).
- **Phone number:** In some regions you can use a long code or toll-free as origination number. If Pinpoint assigns one, note it.
- Set **PINPOINT_ORIGINATION_NUMBER** only if you have a specific origination number to use; otherwise leave it unset. For **Sender ID** in India, Pinpoint often uses the configured Sender ID and you may not need this env var (leave empty and test).

---

## 5. IAM permissions

The app needs permission to send SMS via Pinpoint. Use the same IAM user as for S3, or create a dedicated user.

**Minimum policy for Pinpoint SMS:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "mobiletargeting:SendMessages",
        "mobiletargeting:SendOTPMessage"
      ],
      "Resource": "arn:aws:mobiletargeting:*:*:apps/*"
    }
  ]
}
```

If you use **SendMessages** only (as in this app), `mobiletargeting:SendMessages` is enough. Attach this policy to the IAM user whose **Access key ID** and **Secret access key** you use for the app.

---

## 6. Environment variables

Set these where the app runs (e.g. Amplify **Environment variables**).

| Variable | Required | Description |
|----------|----------|-------------|
| `OTP_PROVIDER` | Yes | `pinpoint` for SMS; `dev` for console logging. |
| `PINPOINT_APPLICATION_ID` | Yes | Pinpoint project ID (from step 1). |
| `AWS_REGION` | Yes | Region where the Pinpoint project lives (e.g. `ap-south-1`, `us-east-1`). |
| `AWS_ACCESS_KEY_ID` | Yes* | IAM user access key (same as S3 if shared). |
| `AWS_SECRET_ACCESS_KEY` | Yes* | IAM user secret key. |
| `PINPOINT_DEFAULT_COUNTRY_CODE` | No | Default country code for 10-digit numbers (default `91`). |
| `PINPOINT_OTP_MESSAGE` | No | SMS body; use `{code}` for the OTP. Default: `Your verification code is {code}. Valid for 5 minutes.` |
| `PINPOINT_ORIGINATION_NUMBER` | No | Origination phone number if required by your region. |

\* If the app runs on EC2/ECS/Amplify with an IAM role, you can omit credentials; the SDK will use the role.

---

## 7. Phone number format

- The app stores and sends **10-digit** Indian numbers (e.g. `9876543210`). The provider converts them to **E.164** using `PINPOINT_DEFAULT_COUNTRY_CODE` (e.g. `+919876543210`).
- For other countries, set `PINPOINT_DEFAULT_COUNTRY_CODE` (e.g. `1` for US). Numbers already including a country code are passed through.

---

## 8. Verify

1. Set **OTP_PROVIDER=pinpoint** and all required env vars.
2. Restart or redeploy the app.
3. On **Admin login** or **Customer login**, enter a phone number and click **Send OTP**.
4. In **sandbox**, the number must be added as a verified destination in Pinpoint; in **production**, any number in the supported country should receive the SMS.
5. Check **Pinpoint** → **Analytics** → **SMS** for delivery status, or CloudWatch logs if the app logs Pinpoint errors.

---

## Troubleshooting

- **InvalidParameterException / origination:** Ensure the SMS channel and origination identity are configured for the destination country. Set **PINPOINT_ORIGINATION_NUMBER** if you have a number.
- **Throttling:** Pinpoint has account and per-destination limits; the app already rate-limits OTP requests per phone and IP.
- **Sandbox:** Only verified destinations receive SMS until production access is approved.
