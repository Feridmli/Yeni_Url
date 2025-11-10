// SeaportUtils.js
import { Seaport } from "@opensea/seaport-js";
import { ethers } from "ethers";

// Proxy kontrakt ünvanı
const PROXY_ADDRESS = "0x9656448941C76B79A39BC4ad68f6fb9F01181EC7"; // marketplace / Seaport proxy

// NFT kontrakt ünvanı
const NFT_CONTRACT_ADDRESS = "0x54a88333F6e7540eA982261301309048aC431eD5"; // ERC721A NFT kontrakt ünvanı

// Cüzdan qoşma funksiyası
export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask və ya Wallet yoxdur");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

// NFT alışı (fulfill order) funksiyası
export async function fulfillOrder(seaport, signer, order, options = {}) {
  try {
    // Əgər seaport yoxdursa, yaradılır
    if (!seaport) seaport = new Seaport(signer, { contractAddress: PROXY_ADDRESS });

    const tx = await seaport.fulfillOrder({
      order: order.seaportOrder,
      accountAddress: await signer.getAddress(),
      recipient: options.recipient || await signer.getAddress()
    });

    await tx.wait();
    alert(`NFT #${order.tokenId} alındı ✅`);
  } catch (e) {
    console.error("Fulfill error:", e);
    alert("Alım uğursuz oldu ❌");
  }
}

// NFT kontrakt ünvanını istifadə etmək üçün nümunə:
// Məsələn, order yaratarkən offer sahəsində
export function getNFTContractAddress() {
  return NFT_CONTRACT_ADDRESS;
}