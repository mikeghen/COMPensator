import React, { useState } from 'react';
import { ethers } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { 
    COMPENSATOR_ADDRESS, 
    COMPENSATOR_ABI, 
    COMP_ADDRESS, 
    ERC20_ABI } from "../config/constants";



const DelegateDashboard = () => {
    const [delegated, setDelegated] = useState(350);
    const [availableRewards, setAvailableRewards] = useState(82.345);
    const [rewardRate, setRewardRate] = useState(10);
    const [rewardsUntil, setRewardsUntil] = useState('November 12, 2024');

    const handleDeposit = () => {
        // TODO
    };

    const handleWithdraw = () => {
        // TODO
    }

    const handleSetRewardRate = () => {
        // TODO
    }

    return (
        <div className="container">
            <h2>Delegate Dashboard</h2><br />
            <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Delegate Statistics</div>
                        <div className="card-body">
                            <p><strong>Delegated:</strong> {delegated} COMP</p>
                            <p><strong>Available Rewards:</strong> {availableRewards} COMP</p>
                            <p><strong>Reward Rate:</strong> {rewardRate} COMP/month</p>
                            <p><strong>Rewards Until:</strong> {rewardsUntil}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Manage Delegator Rewards</div>
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="descriptionInput">Deposit Rewards</label>
                                <input type="text" className="form-control" id="descriptionInput" />
                            </div>
                            <button className="btn btn-primary" onClick={handleDeposit}>
                                Deposit
                            </button>
                            <br />
                            <br />
                            <div className="form-group">
                                <label htmlFor="descriptionInput">Withdraw Rewards</label>
                                <input type="text" className="form-control" id="descriptionInput" />
                            </div>
                            <button className="btn btn-primary" onClick={handleWithdraw}>
                                Withdraw
                            </button>
                            <br />
                            <br />
                            <div className="form-group">
                                <label htmlFor="descriptionInput">Change Reward Rate</label>
                                <input type="text" className="form-control" id="descriptionInput" />
                            </div>
                            <button className="btn btn-primary" onClick={handleSetRewardRate}>
                                Set Reward Rate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelegateDashboard;


