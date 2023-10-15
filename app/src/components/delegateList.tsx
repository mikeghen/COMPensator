import React, { useState, useEffect } from 'react';
import { useContractRead } from "wagmi";
import DelegateRow from './delegateRow';
import DelegatorDashboard from './delegatorDashboard';
import { COMPENSATOR_FACTORY_ABI, COMPENSATOR_FACTORY_ADDRESS } from "../config/constants";

const DelegateList = () => {
    const [delegates, setDelegates] = useState<any[]>([]);
    const [selectedDelegate, setSelectedDelegate] = useState<string | null>(null);

    // Get the delegates from the CompensatorFactory contract
    const delegatesData = useContractRead({
        addressOrName: COMPENSATOR_FACTORY_ADDRESS,
        contractInterface: COMPENSATOR_FACTORY_ABI,
        functionName: 'getCompensators',
        watch: true,
    });

    useEffect(() => {
        if (delegatesData.data) {
            setDelegates(delegatesData.data as any[]);
        }
    }, [delegatesData.data]);

    const handleDelegateClick = (delegateAddress: string) => {
        setSelectedDelegate(delegateAddress);
    };

    return (
        <div className="container">
            {selectedDelegate ? (
                <DelegatorDashboard compensatorAddress={selectedDelegate} />
            ) : (
                <>
                    <h2>Incentivized Delegates</h2><br />
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Delegate Name</th>
                                <th>Delegate</th>
                                <th>Delegated</th>
                                <th>Reward Rate</th>
                                <th>Reward Per Month Per COMP</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delegates.map((delegate, index) => (
                                <DelegateRow key={index} compensatorAddress={delegate.toString()} onDelegateClick={handleDelegateClick} />
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default DelegateList;

