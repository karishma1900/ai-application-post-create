import React from "react";
import "./pricing.css"; // Make sure to import CSS

function Pricing() {
  return (
    <div className="pricing-wrapper">
      <div className="abstract-bg"></div>

      <h2 className="pricing-title">A Plan for Every Need</h2>
      <p className="pricing-subtitle">Choose your plan and start creating pages easily.</p>

      <div className="pricing-container">
        {/* Free Plan */}
        <div className="pricing-card">
          <p className="plan-name">Free Plan</p>
          <p className="plan-price">$0</p>
          <p className="plan-desc">Get 30 credits to create and publish pages.</p>
          <ul className="plan-features">
            <li>✔ 30 Credits Included</li>
            <li>✔ Create Website Pages</li>
            <li>✔ Add Topics & Content</li>
            <li>✔ Publish Content</li>
          </ul>
          <button className="plan-btn">Get Started</button>
        </div>

        {/* Premium Plan */}
        <div className="pricing-card premium">
          <p className="plan-name">Premium Plan</p>
          <p className="plan-price">$70</p>
          <p className="plan-desc">Get 500 credits and unlock full features.</p>
          <ul className="plan-features">
            <li>✔ 500 Credits Included</li>
            <li>✔ Unlimited Page Creation</li>
            <li>✔ Fast Publishing</li>
            <li>✔ Priority Support</li>
          </ul>
          <button className="plan-btn premium-btn">Upgrade Now</button>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
