import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ethers, BigNumber } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { approve, delegateDeposit, delegateWithdraw, setRewardRate, createCompensator } from '../utils/compensator';
import { formatTokenAmount } from '../utils/helpers';
import {
    COMPENSATOR_ADDRESS,
    COMPENSATOR_FACTORY_ADDRESS,
    COMPENSATOR_FACTORY_ABI,
    COMPENSATOR_ABI,
    COMP_ADDRESS,
    ERC20_ABI
} from "../config/constants";


const DelegateDashboard = () => {

    const { address } = useAccount();

    const [compensatorAddress, setCompensatorAddress] = useState('');
    const [delegated, setDelegated] = useState('');
    const [userCompBalance, setUserCompBalance] = useState('');
    const [availableRewards, setAvailableRewards] = useState('');
    const [compRewardRate, setCompRewardRate] = useState('');
    const [rewardsUntil, setRewardsUntil] = useState('');
    const [delegateName, setDelegateName] = useState('');
    const [compAllowance, setCompAllowance] = useState('');
    const [approveLoading, setApproveLoading] = useState(false);
    const [depositLoading, setDepositLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [rewardRateLoading, setRewardRateLoading] = useState(false);

    const [depositInput, setDepositInput] = useState('');
    const [withdrawInput, setWithdrawInput] = useState('');
    const [rewardRateInput, setRewardRateInput] = useState('');

    // Check if the user has a compensator contract
    const compensatorAddressData = useContractRead({
        addressOrName: COMPENSATOR_FACTORY_ADDRESS,
        contractInterface: COMPENSATOR_FACTORY_ABI,
        functionName: 'getCompensator',
        args: [address],
        watch: true,
    });

    useEffect(() => {
        if (compensatorAddressData.data) {
            if (compensatorAddressData.data.toString() !== ethers.constants.AddressZero) {
                // If the user has a compensator contract, set the compensator address
                setCompensatorAddress(compensatorAddressData.data.toString());
            }
        }
    }, [compensatorAddressData.data]);

    // Get the allowance of COMPENSATOR_ADDRESS to spend the user's COMP tokens
    const compAllowanceData = useContractRead({
        addressOrName: COMP_ADDRESS,
        contractInterface: ERC20_ABI,
        functionName: 'allowance',
        args: [address, compensatorAddress],
        watch: true,
    });

    useEffect(() => {
        if (compAllowanceData.data) {
            setCompAllowance(formatTokenAmount(compAllowanceData.data.toString(), 18, 2));
        }
    }, [compAllowanceData.data]);

    // Get the amount of COMP in the Delegator contract
    const delegatedBalanceData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: ERC20_ABI,
        functionName: 'totalSupply',
        watch: true,
    });

    useEffect(() => {
        if (delegatedBalanceData.data) {
            setDelegated(formatTokenAmount(delegatedBalanceData.data.toString(), 18, 2));
        }
    }, [delegatedBalanceData.data]);

    // Get the COMP token balance of the user's address
    const userCompBalanceData = useContractRead({
        addressOrName: COMP_ADDRESS,
        contractInterface: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        watch: true,
    });

    useEffect(() => {
        if (userCompBalanceData.data) {
            setUserCompBalance(formatTokenAmount(userCompBalanceData.data.toString(), 18, 2));
        }
    }, [userCompBalanceData.data]);

    // Get the available rewards from the Compensator contract
    const availableRewardsData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'availableRewards',
        watch: true,
    });

    useEffect(() => {
        if (availableRewardsData.data) {
            setAvailableRewards(formatTokenAmount(availableRewardsData.data.toString(), 18, 2));
        }
    }, [availableRewardsData.data]);

    // Get the reward rate from the Compensator contract
    const rewardRateData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'rewardRate',
        watch: true,
    });

    useEffect(() => {
        if (rewardRateData.data) {
            // Convert the reward rate from per second to per month
            const rewardRatePerMonth = rewardRateData.data.mul(60).mul(60).mul(24).mul(30);
            setCompRewardRate(formatTokenAmount(rewardRatePerMonth.toString(), 18, 2));
        }
    }, [rewardRateData.data]);

    // Get the rewards until from the Compensator contract
    const rewardsUntilData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'rewardsUntil',
        watch: true,
    });

    useEffect(() => {
        if (rewardsUntilData.data) {
            const date = new Date(rewardsUntilData.data.toNumber() * 1000);
            const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            setRewardsUntil(dateString);
        }
    }, [rewardsUntilData.data]);

    const handleApproveCOMP = async () => {
        try {
            setApproveLoading(true);
            await approve(COMP_ADDRESS, compensatorAddress);
            toast.success('COMP approved!');
        } catch (error) {
            toast.error('Error approving COMP');
            console.log(error);
        } finally {
            setApproveLoading(false);
        }
    };

    const handleDelegateDeposit = async () => {
        try {
            const amount = ethers.utils.parseEther(depositInput);
            setDepositLoading(true);
            await delegateDeposit(amount, compensatorAddress);
            toast.success('Deposit successful!');
        } catch (error) {
            toast.error('Error depositing COMP');
            console.log(error);
        } finally {
            setDepositLoading(false);
        }
    };

    const handleDelegateWithdraw = async () => {
        try {
            const amount = ethers.utils.parseEther(withdrawInput);
            setWithdrawLoading(true);
            await delegateWithdraw(amount, compensatorAddress);
            toast.success('Withdrawal successful!');
        } catch (error) {
            toast.error('Error withdrawing COMP');
            console.log(error);
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleSetRewardRate = async () => {
        try {
            // Convert the monthly rate to a per second rate
            const secondsInAMonth = 30 * 24 * 60 * 60; // Approximate number of seconds in a month
            const newRatePerMonth = ethers.utils.parseEther(rewardRateInput);
            const newRatePerSecond = newRatePerMonth.div(secondsInAMonth);

            setRewardRateLoading(true);
            await setRewardRate(newRatePerSecond, compensatorAddress);
            toast.success('Reward rate set successfully!');
        } catch (error) {
            toast.error('Error setting reward rate');
            console.log(error);
        } finally {
            setRewardRateLoading(false);
        }
    };

    const handleCreateCompensator = async () => {
        try {
            setApproveLoading(true);
            await createCompensator(address, delegateName);
            toast.success('Compensator contract created successfully!');
        } catch (error) {
            toast.error('Error creating compensator contract');
            console.log(error);
        } finally {
            setApproveLoading(false);
        }
    };

    return (
        <div className="container">
            {compensatorAddress === '' ? (
                <div className="row justify-content-center">
                <div className="col-md-6">
                <div className="card">
                    <div className="card-header">Create Compensator Contract</div>
                    <div className="card-body">
                        
                                <div className="alert alert-warning" role="alert">
                                    You do not have a compensator contract yet. Create one below!
                                </div>
                                <div className="input-group">
                                    <input type="text" className="form-control" id="delegateNameInput" value={delegateName} onChange={e => setDelegateName(e.target.value)} placeholder="Enter Delegate Name" />
                                    <div className="input-group-append">
                                        <button className="btn btn-primary" onClick={handleCreateCompensator}>Create Compensator Contract</button>
                                    </div>
                                </div>
                                <br/><br/>
                                <div className="alert alert-success" role="alert">
                                    <h4 className="alert-heading">How Compensator works:</h4>
                                    <p>1. Create a Compensator contract with a descriptive name</p>
                                    <p>2. After creation, deposit COMP rewards and set a reward rate</p>
                                    <p>3. Promote your Compensator contract to the community!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <h2>Delegate Dashboard</h2><br />
                    <div className="row">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div className="card">
                                <div className="card-header">Delegate Statistics</div>
                                <div className="card-body">
                                    <p><strong>Compensator Address:</strong> {compensatorAddress}</p>
                                    <p><strong>Delegated:</strong> <div style={{display: 'flex', alignItems: 'center'}}>{delegated} <img src="/compound-comp-logo.svg" alt="COMP" style={{width: '20px', height: '20px', marginLeft: '5px'}} /></div></p>
                                    <p><strong>Available Rewards:</strong> <div style={{display: 'flex', alignItems: 'center'}}>{availableRewards} <img src="/compound-comp-logo.svg" alt="COMP" style={{width: '20px', height: '20px', marginLeft: '5px'}} /></div></p>
                                    <p><strong>Reward Rate:</strong> <div style={{display: 'flex', alignItems: 'center'}}>{compRewardRate} <img src="/compound-comp-logo.svg" alt="COMP" style={{width: '20px', height: '20px', marginLeft: '5px'}} />/month</div></p>
                                    <p><strong>Rewards Until:</strong> {rewardsUntil}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div className="card">
                                <div className="card-header">Manage Delegator Rewards</div>
                                <div className="card-body">
                                    <p><div style={{display: 'flex', alignItems: 'center'}}><strong>COMP Balance:</strong> &nbsp; {userCompBalance} <img src="/compound-comp-logo.svg" alt="COMP" style={{width: '20px', height: '20px', marginLeft: '5px'}} /></div></p>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" id="depositInput" value={depositInput} onChange={e => setDepositInput(e.target.value)} />
                                        {Number(compAllowance) > 0 ? (
                                            <div className="input-group-append">
                                                <button className="btn btn-primary" onClick={handleDelegateDeposit}>
                                                    {depositLoading ? (
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        'Deposit'
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="input-group-append">
                                                <button className="btn btn-primary" onClick={handleApproveCOMP}>
                                                    {approveLoading ? (
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        'Approve'
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <br />
                                    <p><div style={{display: 'flex', alignItems: 'center'}}><strong>Available Rewards:</strong> &nbsp; {availableRewards} <img src="/compound-comp-logo.svg" alt="COMP" style={{width: '20px', height: '20px', marginLeft: '5px'}} /></div></p>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" id="withdrawInput" value={withdrawInput} onChange={e => setWithdrawInput(e.target.value)} />
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" onClick={handleDelegateWithdraw}>
                                                {withdrawLoading ? (
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                ) : (
                                                    'Withdraw'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <br />
                                    <p><div style={{display: 'flex', alignItems: 'center'}}><strong>Rewards Rate:</strong> &nbsp; {compRewardRate} <img src="/compound-comp-logo.svg" alt="COMP" style={{width: '20px', height: '20px', marginLeft: '5px'}} />/month</div></p>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="rewardRateInput"
                                            value={rewardRateInput}
                                            onChange={e => setRewardRateInput(e.target.value)}
                                        />
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" onClick={handleSetRewardRate}>
                                                {rewardRateLoading ? (
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                ) : (
                                                    'Set Reward Rate'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

            export default DelegateDashboard;


