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
                    <h2>Delegates</h2><br />
                    <div className="row">
                        <div className="col-md-6">
                            <div className="alert alert-success" role="alert">
                                <h4 className="alert-heading">Welcome to Compensator!</h4>
                                Here you can delegate your COMP to a delegate and earn COMP rewards from the delegate themself. <br/><br/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="alert alert-primary" role="alert">
                                <h4 className="alert-heading">How Compensator works:</h4>
                                <p>1. Find a delegate in this list you'd like to delegate to and click Delegate</p>
                                <p>2. Deposit your COMP into the Delegate's Compensator contract</p>
                                <p>3. Periodically claim your rewards</p>
                                <p>4. Withdraw your COMP to stop delegating</p>
                            </div>
                        </div>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Delegate Name</th>
                                <th>Delegate</th>
                                <th>Delegated</th>
                                <th>Reward Rate</th>
                                <th>APR</th>
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

