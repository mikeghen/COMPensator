import React from 'react';


const DelegateDashboard = () => {

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
                            <p><strong>Delegated:</strong> 350 COMP</p>
                            <p><strong>Available Rewards:</strong> 82.345 COMP</p>
                            <p><strong>Reward Rate:</strong> 10 COMP/month</p>
                            <p><strong>Rewards Until:</strong> November 12, 2024</p>
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
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelegateDashboard;


