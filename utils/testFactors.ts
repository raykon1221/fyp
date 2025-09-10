import { getCollateralDiversity01, getWalletActivity01, getRiskSafety01, getRepaymentHistory01, getAccountAge01, getSocialProof01 } from "@/server/factors/aave"; // Import your factor functions

// Lowercase address helper
const lower = (s: string) => s.toLowerCase();

// Function to test all factors and log the results
export async function testFactors(user: `0x${string}`) {
  try {
    // Log each query result to see the raw data before passing it to the smart contract
    const collateralDiversity = await getCollateralDiversity01(user);
    console.log("Collateral Diversity:", collateralDiversity);

    const walletActivity = await getWalletActivity01(user);
    console.log("Wallet Activity:", walletActivity);

    const riskSafety = await getRiskSafety01(user);
    console.log("Risk Safety:", riskSafety);

    const repaymentHistory = await getRepaymentHistory01(user);
    console.log("Repayment History:", repaymentHistory);

    const accountAge = await getAccountAge01(user);
    console.log("Account Age:", accountAge);

    const socialProof = await getSocialProof01(user);
    console.log("Social Proof:", socialProof);

    // Perform the manual score calculation and scale factors to integers
    const scaleFactor = 1e18;  // Scale factor for 1e18
    const factors = {
      repay01: collateralDiversity * scaleFactor, // Scale to integer
      diversity01: walletActivity * scaleFactor,
      age01: riskSafety * scaleFactor,
      activity01: repaymentHistory * scaleFactor,
      risk01: accountAge * scaleFactor,
      social01: socialProof * scaleFactor
    };

    const score = factors.repay01 * 3000 + 
                  factors.diversity01 * 2000 + 
                  factors.age01 * 1500 + 
                  factors.activity01 * 1000 + 
                  factors.risk01 * 1500 + 
                  factors.social01 * 1000;

    const finalScore = score / 10000; // Normalize the final score

    console.log("Calculated Final Score:", finalScore);

    // You can now return these values as needed, or pass them to the smart contract for updating
    return {
      collateralDiversity,
      walletActivity,
      riskSafety,
      repaymentHistory,
      accountAge,
      socialProof,
      finalScore // Add the final score to the results
    };

  } catch (error) {
    console.error("Error while fetching factors:", error);
    return { error: "Error fetching factors" };
  }
}