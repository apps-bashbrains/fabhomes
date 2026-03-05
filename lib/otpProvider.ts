/**
 * OTP provider abstraction: send OTP via SMS (e.g. AWS SNS) or dev console.
 * Swap implementation via env (e.g. OTP_PROVIDER=aws-sns) without refactoring.
 */

export interface OtpProvider {
  sendOtp(phone: string, code: string): Promise<void>;
}

/**
 * Dev implementation: log OTP to console.
 * When OTP_PROVIDER=dev, allowed in any environment (for local/staging). Otherwise blocked in production.
 */
export function createDevOtpProvider(): OtpProvider {
  return {
    async sendOtp(phone: string, code: string) {
      const explicitDev = process.env.OTP_PROVIDER?.toLowerCase() === "dev";
      if (process.env.NODE_ENV === "production" && !explicitDev) {
        throw new Error("Dev OTP provider must not be used in production. Set OTP_PROVIDER=dev for local testing or use a real SMS provider.");
      }
      // eslint-disable-next-line no-console
      console.log(`[OTP Dev] phone=${phone} code=${code}`);
    },
  };
}

/**
 * Get the configured OTP provider. Default: dev (console) when NODE_ENV !== production.
 */
let provider: OtpProvider | null = null;

export function getOtpProvider(): OtpProvider {
  if (!provider) {
    const kind = (process.env.OTP_PROVIDER ?? "dev").toLowerCase();
    if (kind === "dev" || process.env.NODE_ENV !== "production") {
      provider = createDevOtpProvider();
    } else {
      // Production: wire AWS SNS or other provider here
      // provider = createAwsSnsOtpProvider();
      throw new Error("OTP_PROVIDER must be set in production (e.g. aws-sns). Use dev for local.");
    }
  }
  return provider;
}
