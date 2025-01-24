// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyContractModule = buildModule("MyContract", (m) => {
  // Define parameters for constructor arguments
  const initialMessage = m.getParameter("initialMessage", "Hello, Hardhat!");

  // Deploy the MyContract with the initial message
  const myContract = m.contract("MyContract", [initialMessage]);

  return { myContract };
});

export default MyContractModule;
