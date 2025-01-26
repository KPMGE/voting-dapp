// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TuringContractModule = buildModule("TuringContract", (m) => {
  const turingContract = m.contract("Turing", []);
  return { turingContract };
});

export default TuringContractModule;
