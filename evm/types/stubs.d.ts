declare module 'hardhat' {
  export const ethers: any;
}

declare module 'hardhat/config' {
  export type HardhatUserConfig = any;
}

declare module '@nomicfoundation/hardhat-toolbox' {}

declare module 'dotenv' {
  const dotenv: any;
  export default dotenv;
}