import React from 'react';


const DelegatorDashboard = () => {
    const handleClaim = () => {
        // TODO

    };

    const handleDeposit = () => {
        // TODO
    }

    const handleWithdraw = () => {
        // TODO
    }

    return (
        <div className="container">
            <h2>Delegator Dashboard</h2><br />
            <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Delegator Statistics</div>
                        <div className="card-body">
                            <p><strong>Delegated:</strong> 350 COMP (14%)</p>
                            <p><strong>Pending Rewards:</strong> 0.813 COMP</p>
                            <p><strong>Reward Rate:</strong> 0.174 COMP/month</p>
                            <p><strong>Rewards Until:</strong> November 12, 2024</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card">
                        <div className="card-header">Manage Delegation</div>
                        <div className="card-body">
                            <button className="btn btn-primary" onClick={handleClaim}>
                                Claim 0.813 COMP
                            </button>
                            <br/>
                            <br/>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelegatorDashboard;


