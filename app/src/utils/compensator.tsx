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