import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

// 投票コントラクトのアドレスを設定します
const vote = sdk.getContract("0x9Fd9bE94f82E11c2d1833d9b91A84E7Ef110aafC", "vote");

// ERC-20 コントラクトのアドレスを設定します。
const token = sdk.getContract("0x376660eB00C3dB9f86EEfd3DC83dADA3B3c0a2D6", "token");


(async () => {
  try {
    // トレジャリーに 420,000 のトークンを新しく鋳造する提案を作成します
    const amount = 420_000;
    const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
    const executions = [
      {
        // mint を実行するトークンのコントラクトアドレスを設定します
        toAddress: (await token).getAddress(),
        // DAO のネイティブトークンが ETH であるため、プロポーザル作成時に送信したい ETH の量を設定します（今回はトークンを新しく発行するため 0 を設定します）
        nativeTokenValue: 0,
        // ガバナンスコントラクトのアドレスに mint するために、金額を正しい形式（wei）に変換します
        transactionData: (await token).encoder.encode(
          "mintTo", [
          (await vote).getAddress(),
          ethers.utils.parseUnits(amount.toString(), 18),
        ]
        ),
      }
    ];

    await (await vote).propose(description, executions);

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    // 6,900 のトークンを自分たちに譲渡するための提案を作成します
    const amount = 6_900;
    const description = "Should the DAO transfer " + amount + " tokens from the treasury to " +
      process.env.WALLET_ADDRESS + " for being awesome?";
    const executions = [
      {
        nativeTokenValue: 0,
        transactionData: (await token).encoder.encode(
          // トレジャリーからウォレットへの送金を行います。
          "transfer",
          [
            process.env.WALLET_ADDRESS!,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: (await token).getAddress(),
      },
    ];

    await (await vote).propose(description, executions);

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();