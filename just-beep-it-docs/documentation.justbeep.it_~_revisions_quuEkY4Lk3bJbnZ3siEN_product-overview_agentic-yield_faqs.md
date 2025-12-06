---
url: "https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs"
title: "FAQs | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
---

[![Logo](https://documentation.justbeep.it/~gitbook/image?url=https%3A%2F%2F2720193548-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FXodcgn3uvYazoeBEqfgN%252Fsites%252Fsite_x3c2R%252Flogo%252Fus71QJ4dCSb0PtVQio7u%252FBeep%2520logo%2520_%2520mega.png%3Falt%3Dmedia%26token%3D5693182c-0222-4124-ad65-0d2df26cd7bd&width=260&dpr=4&quality=100&sign=92fc6c34&sv=2)![Logo](https://documentation.justbeep.it/~gitbook/image?url=https%3A%2F%2F2720193548-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FXodcgn3uvYazoeBEqfgN%252Fsites%252Fsite_x3c2R%252Flogo%252Fus71QJ4dCSb0PtVQio7u%252FBeep%2520logo%2520_%2520mega.png%3Falt%3Dmedia%26token%3D5693182c-0222-4124-ad65-0d2df26cd7bd&width=260&dpr=4&quality=100&sign=92fc6c34&sv=2)](https://documentation.justbeep.it/)

`Ctrl`  `k`

GitBook Assistant

GitBook Assistant

GitBook Assistant

Working...Thinking...

GitBook Assistant

##### Good night

I'm here to help you with the docs.

What is this page about?What should I read next?Can you give an example?

`Ctrl`  `i`

AIBased on your context

Send

- [What is Beep?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN)
- Product Overview

  - [Agentic Yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield)


- [what is agentic yield?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/what-is-agentic-yield)
- [why should I use beep's agentic yield?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/why-should-i-use-beeps-agentic-yield)
- [core concepts](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/core-concepts)
- [start earning yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/start-earning-yield)
- [supported assets](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/supported-assets)
- [security](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/security)
- [FAQs](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs)

  - [Beep Pay](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/beep-pay)
  - [Agent to Agent payments (a402)](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-to-agent-payments-a402)
  - [Agent Trader](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader)
  - [Rewards](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/rewards)
  - [Resources](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/resources)
  - [Launching soon](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/launching-soon)

[Powered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frgr0Kse7wRCOlaPSZd7)

On this page

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview)
2. [Agentic Yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield)

# FAQs

Everything you need to know before letting Beep’s autonomous agent put your stablecoins to work.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#what-is-agentic-yield)    What is Agentic Yield?

Agentic Yield is Beep’s on-chain automation layer for stablecoin yield. It deploys an agent wallet inside your account that monitors, reallocates, and compounds your USDC across multiple DeFi protocols.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#how-does-it-work)    How does it work?

Here’s what’s going on technically:

- **Wallet Architecture (On-Chain, User-Controlled)**. You have a self-custody wallet. Your self custody wallet stores your USDC. Only your session key can move funds - not Beep, not our servers. All deposits, withdrawals, swaps, and rebalances happen on-chain from your beep wallet. This is your custody layer. Your key signs them, Sui executes them, DeFi protocols settle them, all yields flow back into your wallet.

- **Agent Architecture (Off-Chain Intelligence Layer)**. Our AI agents operate off-chain. Their job is to scan approved DeFi lending markets; score opportunities based on yield, liquidity, and risk; decide when to rebalance or compound; and prepare the recommended transaction bundle. Agents scan DeFi markets, score opportunities, and prepare transaction bundles.

- **DeFi Protocols (On-Chain Execution Layer)**. When the agent recommends a strategy change: it prepares a transaction bundle (deposit, withdraw, swap, etc.). The transaction is sent to your wallet for signing using your session key. The transaction based on the strategy happens directly between your agent wallet and the DeFi smart contract, never our servers. The agent only observes, computes, and suggests.


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#what-we-do-not-do)    What we do not do

- We do not take custody

- We do not bridge your assets secretly

- We do not rehypothecate or move assets cross-chain

- We do not maintain centralized pooled or omnibus wallets


Everything stays in your Sui wallet unless you initiate cross-chain movement.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#putting-it-all-together)    Putting it all together

- Agents = brains (off-chain).

- Wallet = your control (on-chain).

- DeFi = execution (on-chain).


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#is-your-wallet-platform-non-custodial)    Is your wallet platform non-custodial?

We’ve built our wallet service using a leading 3rd party, self-custodial wallet infrastructure provider. There is no centralized/pooled beep wallet. Each user is provisioned their own wallet with their own self-custody private keys, which is designed so that you retain full control of your private key (and therefore your funds).

The user flow is: user connects their decentralized wallet (e.g., Slush wallet) to beep; beep then provisions a beep account wallet to use for agentic yield; beep’s agentic wallet interacts with and controls allocation/re-allocation with defi protocols.

Neither Beep nor its wallet infrastructure provider can move your funds by itself. Session key model (common across modern protocols) is used, our servers can prepare or sponsor transactions for usability, but only your session key can actually sign and move funds, and you can revoke or rotate it at any time.

Embedded wallets are built on globally distributed infrastructure to ensure high uptime and low latency. They leverage secure hardware to ensure only the rightful owner can control their wallet or access its keys.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#how-can-i-manage-my-keys)    How can I manage my keys?

Your beep wallet is provisioned from a leading wallet infrastructure provider and uses a secure, self-custodial key system. You manage your keys through your authentication method (passkey, email login, or device) within your profile in beep dashboard launching at the point of general availability with completed security audit. You can rotate or revoke your session key at any time on your end.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#settlement-blockchain)    Settlement blockchain

Settlement Layer: Sui blockchain. All Beep wallets and transactions settle natively on the Sui blockchain. This includes: your self custody wallet, all deposits/withdrawals, agent-powered strategy, yield allocations and rebalances, rewards, points, and accounting. Sui is our source of truth and our execution environment. Nothing settles on any other blockchain today.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#stablecoins-usdc-on-sui)    Stablecoins: USDC on Sui

USDC (Sui-native USDC) is the base stablecoin used for: deposits, yield-allocation, rebalancing strategies, gas-abstracted payments, and A402/micropayment use cases.

We do not issue our own stablecoin. We do not custody user funds. Currently we only support USDC on Sui as the canonical asset.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#what-3rd-parties-are-you-using-for-self-custodial-wallet-infra-and-bridge-infra)    What 3rd parties are you using for self-custodial wallet infra and bridge infra?

We currently utilize Privy (a Stripe company) for wallet infra to provision wallets. We currently utilize LI.FI for bridge infra.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#where-does-the-yield-come-from)    Where does the yield come from?

Your agent allocates capital to decentralized lending and staking markets such as **Scallop**, **Bluefin**, **Navi**, **Momentum**, and **Suilend**. These protocols pay interest to lenders and distribute ecosystem rewards. The agent continuously scores APYs, liquidity depth, and protocol risk to pick the best net return after gas and fees.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#multi-chain-interactions)    Multi-chain interactions

If a user wants to onboard from another chain (Solana, Ethereum, Base, etc.), they must bridge to or bring their own Sui-native USDC. Beep offers a standard bridge for users, leveraging an industry-leading bridge aggregator.

This ensures:

- You stay in full custody

- We do not run hidden bridge operations

- No “mystery bridging” or background chain moves

- No conversion risks


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#do-i-keep-custody-of-my-funds)    Do I keep custody of my funds?

The agent interacts through **scoped session keys** that can only call approved functions (`deposit()`, `withdraw()`, `claim()`).
You can revoke or rotate those keys anytime.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#can-the-agent-move-my-tokens-somewhere-unsafe)    Can the agent move my tokens somewhere unsafe?

No. Agents can interact only with **whitelisted** and **audited** protocol contracts. They can’t send tokens elsewhere or execute arbitrary code. All actions are recorded on-chain and verifiable from your dashboard.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#what-if-a-protocol-gets-hacked-or-loses-liquidity)    What if a protocol gets hacked or loses liquidity?

Beep constantly monitors protocol health, TVL changes, and risk alerts. If an issue is detected, the agent exits positions when on-chain conditions allow.
Still, DeFi carries inherent risk — only allocate what you’re comfortable using on-chain.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#how-often-does-my-agent-rebalance)    How often does my agent rebalance?

It depends on market movement and gas economics. If a significantly better yield opportunity appears, it moves; otherwise, it holds to avoid unnecessary gas costs. Typical frequency ranges from **1–4 times per day** depending on volatility.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#are-there-any-fees)    Are there any fees?

Currently:

- No deposit or withdrawal fees

- Reallocation gas is covered by the protocol

- Beep charges a performance fee on APY


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#what-tokens-and-networks-are-supported)    What tokens and networks are supported?

Right now: **USDC on SUI**.
Coming soon: **others.**
Multi-chain strategies across BASE and SOL networks are in active testing.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#how-does-the-agent-decide-which-protocol-to-use)    How does the agent decide which protocol to use?

The scoring engine weighs:

- Base + boosted APYs

- Liquidity depth and utilization

- Protocol incentives

- Gas cost vs expected net yield

- On-chain risk metrics


The agent only reallocates when the total score improves enough to offset costs.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#can-i-customize-behavior)    Can I customize behavior?

Soon. You’ll be able to set parameters like:

- Minimum APY delta before rebalancing

- Risk tolerance (stable / balanced / aggressive)

- Protocol allow-/deny-lists


These preferences will live inside your account config.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#can-i-withdraw-anytime)    Can I withdraw anytime?

Yes. You can withdraw your USDC from your dashboard or directly on-chain.
Funds are never time-locked; you always control the exit.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#how-do-i-know-what-the-agent-is-doing-what-are-these-transfers-i-am-seeing-between-wallets-related-t)    How do I know what the agent is doing? What are these transfers I am seeing between wallets related to the agentic yield management?

Every operation emits on-chain events. Your dashboard surfaces transaction history. The transfers you see are the agent moving funds from wallet to different on-chain lending pools to optimize yield, not beep taking custody or withdrawing funds. These movements appear as transfers because the agent is depositing into, withdrawing from, or switching between yield strategies on your behalf. You can revoke permissions at any time.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#is-your-smart-contract-deployed-on-chain)    Is your smart contract deployed on chain?

Our agents and LLMs (based on major foundational models, are centralized via their developer platforms) run off-chain. The logic for planning, scoring, and executing yield strategies happens off-chain, while all actual transactions occur on-chain interacting with the smart contracts of our DeFi integrations. State changes occur directly on-chain. Our list of DeFi integrations can be found in this documentation.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#do-you-have-3rd-party-security-audits)    Do you have 3rd party security audits?

We’re currently in public beta, and our external security audits are in progress. Full third-party audit reports will be published before our GA (general availability) launch in the coming weeks.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs\#will-you-open-source-your-code)    Will you open source your code?

No, we are not an open source project.

[Previoussecurity](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/security) [NextBeep Pay](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/beep-pay)

Last updated 20 days ago