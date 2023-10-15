import React, { useState, useEffect } from 'react';
import { useContractRead } from "wagmi";
import { formatTokenAmount } from '../utils/helpers';
import { COMPENSATOR_ABI, ERC20_ABI, COMP_ADDRESS } from "../config/constants";
import DelegatorDashboard from './delegatorDashboard';

const DelegateRow = ({ compensatorAddress, onDelegateClick }) => {
    const [delegated, setDelegated] = useState('');
    const [delegate, setDelegate] = useState('');
    const [delegateName, setDelegateName] = useState('');
    const [rewardRate, setRewardRate] = useState('');
    const [rewardPerMonthPerComp, setRewardPerMonthPerComp] = useState('');

    // Get the amount of COMP in the Compensator contract
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

    // Get the delegate of the Compensator contract
    const delegateData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'delegate',
        watch: true,
    });

    useEffect(() => {
        if (delegateData.data) {
            setDelegate(delegateData.data.toString());
        }
    }, [delegateData.data]);

    // Get the delegate name from the Compensator contract
    const delegateNameData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'delegateName',
        watch: true,
    });

    useEffect(() => {
        if (delegateNameData.data) {
            setDelegateName(delegateNameData.data.toString());
        }
    }, [delegateNameData.data]);

    // Get the reward rate from the Compensator contract
    const rewardRateData = useContractRead({
        addressOrName: compensatorAddress,
        contractInterface: COMPENSATOR_ABI,
        functionName: 'rewardRate',
        watch: true,
    });

    useEffect(() => {
        if (rewardRateData.data && delegatedBalanceData.data) {
            // Convert the reward rate from per second to per month
            const rewardRatePerMonth = rewardRateData.data.mul(60).mul(60).mul(24).mul(30);
            setRewardRate(formatTokenAmount(rewardRatePerMonth.toString(), 18, 2));
            // Compute and set the reward per month per COMP delegated
            if(Number(delegated) === 0) {
                setRewardPerMonthPerComp('0');
                return;
            } else {
                const rewardPerMonthPerComp = rewardRatePerMonth.div(Number(delegated));
                setRewardPerMonthPerComp(formatTokenAmount(rewardPerMonthPerComp.toString(), 18, 2));
            }
        }
    }, [rewardRateData.data, delegatedBalanceData.data]);

    const handleDelegateClick = () => {
        onDelegateClick(compensatorAddress);
    };

    return (
        <tr>
            <td>{delegateName}</td>
            <td>{delegate.slice(0, 6) + '...' + delegate.slice(-4)}</td>
            <td>{delegated} COMP</td>
            <td>{rewardRate} COMP/month</td>
            <td>{rewardPerMonthPerComp} /COMP/month</td>
            <td><button className="btn btn-primary" onClick={handleDelegateClick}>Delegate</button></td>
        </tr>
    );
};

export default DelegateRow;

