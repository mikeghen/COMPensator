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
    const [delegates, setDelegates] = useState([]); 
    const [pendingRewards, setPendingRewards] = useState('');
    const [compAllowance, setCompAllowance] = useState('');
    const [compBalance, setCompBalance] = useState('');
    const [approveLoading, setApproveLoading] = useState(false);
    const [depositLoading, setDepositLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);

    const [depositInput, setDepositInput] = useState('');
    const [withdrawInput, setWithdrawInput] = useState('');

    // Get the delegates of the Delegator contract
    const delegatesData = useContractRead({
        addressOrName: COMPENSATOR_FACTORY_ADDRESS,
        contractInterface: COMPENSATOR_FACTORY_ABI,
        functionName: 'getCompensators',
        watch: true,
    });

    useEffect(() => {
        if (delegatesData.data) {
            console.log("delegatesData.data", delegatesData.data);
            setDelegates(delegatesData.data);
        }
    }, [delegatesData.data]);

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
            console.log("pendingRewardsData.data.toString()", pendingRewardsData.data.toString());
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
            <h2>Delegator Dashboard</h2><br />
            <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Delegator Statistics</div>
                        <div className="card-body">
                            <p><strong>Delegated:</strong> {delegated} COMP</p>
                            <p><strong>Pending Rewards:</strong> {pendingRewards} COMP</p>
                            <p><strong>COMP Balance:</strong> {compBalance} COMP</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Manage Delegation</div>
                        <div className="card-body">
                            <p><strong>COMP Balance:</strong> {compBalance} COMP</p>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" id="depositInput" value={depositInput} onChange={e => setDepositInput(e.target.value)} />
                                <div className="input-group-append">
                                    <span className="input-group-text">COMP</span>
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
                            <p><strong>Delegated:</strong> {delegated} COMP</p>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" id="withdrawInput" value={withdrawInput} onChange={e => setWithdrawInput(e.target.value)} />
                                <div className="input-group-append">
                                    <span className="input-group-text">COMP</span>
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
                            <p><strong>Pending Rewards:</strong> {pendingRewards} COMP</p>
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
