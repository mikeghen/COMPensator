import { BigNumber, ethers } from 'ethers';
import { 
    COMPENSATOR_ADDRESS, 
    COMPENSATOR_ABI, 
    COMP_ADDRESS, 
    ERC20_ABI 
} from '../config/constants'; 

// Methods for executing transaction on Ethereum 

export const getProvider = () => {
    if (typeof window.ethereum !== 'undefined') {
        return new ethers.providers.Web3Provider(window.ethereum);
    }
    throw new Error('Ethereum provider not found.');
};

export const getSigner = (provider: ethers.providers.Web3Provider) => {
    return provider.getSigner();
};

export const approve = async (depositToken: string) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        depositToken,
        ERC20_ABI,
        signer
    );

    // TODO: No max approval
    const maxApprovalAmount = ethers.constants.MaxUint256;
    const approvalTx = await contract.approve(COMPENSATOR_ADDRESS, maxApprovalAmount);
    await approvalTx.wait();
};

export const delegateDeposit = async (amount: BigNumber) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const depositTx = await contract.delegateDeposit(amount);
    await depositTx.wait();
};

export const delegateWithdraw = async (amount: BigNumber) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const withdrawTx = await contract.delegateWithdraw(amount);
    await withdrawTx.wait();
};

export const setRewardRate = async (newRate: BigNumber) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const setRewardRateTx = await contract.setRewardRate(newRate);
    await setRewardRateTx.wait();
};

export const delegatorDeposit = async (amount: BigNumber) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const depositTx = await contract.delegatorDeposit(amount);
    await depositTx.wait();
};

export const delegatorWithdraw = async (amount: BigNumber) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const withdrawTx = await contract.delegatorWithdraw(amount);
    await withdrawTx.wait();
};

export const claimRewards = async () => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const claimRewardsTx = await contract.claimRewards();
    await claimRewardsTx.wait();
};

export const getPendingRewards = async (delegator: string) => {
    const provider = await getProvider();
    const signer = await getSigner(provider);
    const contract = new ethers.Contract(
        COMPENSATOR_ADDRESS,
        COMPENSATOR_ABI,
        signer
    );

    const pendingRewards = await contract.getPendingRewards(delegator);
    return pendingRewards;
};