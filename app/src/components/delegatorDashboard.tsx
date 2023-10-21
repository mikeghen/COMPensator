import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ethers } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { approve, delegatorDeposit, delegatorWithdraw, claimRewards } from '../utils/compensator';
import { formatTokenAmount } from '../utils/helpers';
import {
    COMPENSATOR_FACTORY_ADDRESS,
    COMPENSATOR_FACTORY_ABI,
    COMPENSATOR_ABI,
    COMP_ADDRESS,
    ERC20_ABI
} from "../config/constants";

const DelegatorDashboard = ({ compensatorAddress }) => {
    const { address } = useAccount();

    const [delegated, setDelegated] = useState('');
    const [totalDelegated, setTotalDelegated] = useState('');
    const [availableRewards, setAvailableRewards] = useState('');
    const [apr, setApr] = useState(''); 
    const [rewardsUntil, setRewardsUntil] = useState(''); 
    const [rewardRate, setRewardRate] = useState('');
    const [pendingRewards, setPendingRewards] = useState('');
    const [compAllowance, setCompAllowance] = useState('');
    const [compBalance, setCompBalance] = useState('');
    const [approveLoading, setApproveLoading] = useState(false);
    const [depositLoading, setDepositLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);

    const [depositInput, setDepositInput] = useState('');
    const [withdrawInput, setWithdrawInput] = useState('');
    const [delegateName, setDelegateName] = useState('');
    const [delegateAddress, setDelegateAddress] = useState('');

    const rewardRateData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'rewardRate',
        args: [],
        watch: true,
    });

    useEffect(() => {
        if (rewardRateData.data) {
            // Convert the reward rate from units per second to units per month
            const rewardRatePerMonth = ethers.BigNumber.from(rewardRateData.data.toString()).mul(60 * 60 * 24 * 30);
            // Convert the reward rate to APR using the totalSupply of COMP in the Compensator contract
             // Compute and set the reward per month per COMP delegated
             if(Number(totalDelegated) === 0) {
                setApr('0');
                return;
            } else {
                const rewardPerMonthPerComp = rewardRatePerMonth.div(Number(totalDelegated)).mul(12).mul(100);
                setApr(formatTokenAmount(rewardPerMonthPerComp.toString(), 18, 2));
            }
            setRewardRate(formatTokenAmount(rewardRatePerMonth.toString(), 18, 6));

            // Calculate rewards until date
            const now = new Date();
            const secondsUntil = Number(availableRewards) / Number(rewardRateData.data.toString());
            const secondsUntilDate = new Date(now.getTime() + secondsUntil * 1000);
            const formattedDate = secondsUntilDate.getFullYear() + '-' + (secondsUntilDate.getMonth()+1).toString().padStart(2, '0') + '-' + secondsUntilDate.getDate().toString().padStart(2, '0');
            setRewardsUntil(formattedDate);
        }
    }, [rewardRateData.data]);

    const availableRewardsData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'availableRewards',
        args: [],
        watch: true,
    });

    useEffect(() => {
        if (availableRewardsData.data) {
            setAvailableRewards(formatTokenAmount(availableRewardsData.data.toString(), 18, 6));
        }
    },  [availableRewardsData.data]);

    const totalDelegatedData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'totalSupply',
        watch: true,
    });

    useEffect(() => {
        if (totalDelegatedData.data) {
            setTotalDelegated(formatTokenAmount(totalDelegatedData.data.toString(), 18, 2));
        }
    }, [totalDelegatedData.data]);

    // Get the delegate for this compensator contract
    const delegateData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'delegate',
        watch: true,
    });

    useEffect(() => {
        if (delegateData.data) {
            setDelegateAddress(ethers.utils.getAddress(delegateData.data));
        }
    }, [delegateData.data]);



    // Get the name of the delegate from the Compensator contract
    const delegateNameData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'delegateName',
        args: [],
        watch: true,
    });

    useEffect(() => {
        if (delegateNameData.data) {
            setDelegateName(delegateNameData.data);
        }
    }, [delegateNameData.data]);


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
        functionName: 'balanceOf',
        args: [address],
        watch: true,
    });

    useEffect(() => {
        if (delegatedBalanceData.data) {
            setDelegated(formatTokenAmount(delegatedBalanceData.data.toString(), 18, 2));
        }
    }, [delegatedBalanceData.data]);

    // Get the pending rewards from the Compensator contract
    const pendingRewardsData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'getPendingRewards',
        args: [address],
        watch: true,
    });

    useEffect(() => {
        if (pendingRewardsData.data) {
            console.log("pendingRewardsData.data.toString()", pendingRewardsData.data);
            setPendingRewards(formatTokenAmount(pendingRewardsData.data.toString(), 18, 6));
        }
    }, [pendingRewardsData.data, address]);

    // Get the COMP balance of the user
    const compBalanceData = useContractRead({
        addressOrName: COMP_ADDRESS,
        contractInterface: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        watch: true,
    });

    useEffect(() => {
        if (compBalanceData.data) {
            setCompBalance(formatTokenAmount(compBalanceData.data.toString(), 18, 2));
        }
    }, [compBalanceData.data]);

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

    const handleDelegatorDeposit = async () => {
        try {
            const amount = ethers.utils.parseEther(depositInput);
            setDepositLoading(true);
            await delegatorDeposit(amount, compensatorAddress);
            toast.success('Deposit successful!');
        } catch (error) {
            toast.error('Error depositing COMP');
            console.log(error);
        } finally {
            setDepositLoading(false);
        }
    };

    const handleDelegatorWithdraw = async () => {
        try {
            const amount = ethers.utils.parseEther(withdrawInput);
            setWithdrawLoading(true);
            await delegatorWithdraw(amount, compensatorAddress);
            toast.success('Withdrawal successful!');
        } catch (error) {
            toast.error('Error withdrawing COMP');
            console.log(error);
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleClaimRewards = async () => {
        try {
            setClaimLoading(true);
            await claimRewards(compensatorAddress);
            toast.success('Claim successful!');
        } catch (error) {
            toast.error('Error claiming rewards');
            console.log(error);
        } finally {
            setClaimLoading(false);
        }
    };

    return (
        <div className="container">
            
            <h2>Delegate: {delegateName}</h2><br />
            <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Delegate Information</div>
                        <div className="card-body">
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>APR:</strong> &nbsp; {apr}%</div></p>
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Rewards Until:</strong> &nbsp; {rewardsUntil}</div></p>
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Total Delegated:</strong> &nbsp; {totalDelegated} <img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></div></p>
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Available Rewards:</strong> &nbsp; {availableRewards} <img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></div></p>
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Reward Rate:</strong> &nbsp; {rewardRate} <img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} />/month</div></p>
                            <p><strong>Delegate Address:</strong><br/> {delegateAddress}</p>
                            <p><strong>Compensator Address:</strong><br/>{compensatorAddress}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Manage Delegation</div>
                        <div className="card-body">
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Your Balance: </strong>&nbsp; {compBalance} <img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></div></p>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" id="depositInput" value={depositInput} onChange={e => setDepositInput(e.target.value)} />
                                <div className="input-group-append">
                                    <span className="input-group-text"><img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></span>
                                </div>
                            </div>
                            {Number(compAllowance) > 0 ? (
                                <button className="btn btn-primary" onClick={handleDelegatorDeposit}>
                                    {depositLoading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        'Deposit'
                                    )}
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleApproveCOMP}>
                                    {approveLoading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        'Approve'
                                    )}
                                </button>
                            )}
                            <br />
                            <br />
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Delegated:</strong>&nbsp; {delegated} <img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></div></p>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" id="withdrawInput" value={withdrawInput} onChange={e => setWithdrawInput(e.target.value)} />
                                <div className="input-group-append">
                                    <span className="input-group-text"><img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></span>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={handleDelegatorWithdraw}>
                                {withdrawLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    'Withdraw'
                                )}
                            </button>
                            <br />
                            <br />
                            <p><div style={{ display: 'flex', alignItems: 'center' }}><strong>Pending Rewards:</strong> &nbsp;  {pendingRewards} <img src="/compound-comp-logo.svg" alt="COMP" style={{ width: '20px', height: '20px', marginLeft: '5px' }} /></div></p>
                            <button className="btn btn-primary" onClick={handleClaimRewards}>
                                {claimLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    'Claim Rewards'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        
    );
};

export default DelegatorDashboard;
