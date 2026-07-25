import React, { useEffect, useState } from "react";
import { Check, Crown, Download } from "lucide-react";
import Button from "../components/common/Button";
import { getProfile } from "../api/userApi";
import { upgradePlan } from "../api/subscriptionApi";

const plans = [
  {
    name: "Free",
    price: "₹0",
    downloads: "1 Video / Day",
    features: [
      "Watch all free videos",
      "1 download per day",
      "Basic video quality",
      "Download history",
    ],
  },
  {
    name: "Premium",
    price: "₹299 / month",
    downloads: "10 Videos / Day",
    features: [
      "Unlimited premium videos",
      "10 downloads per day",
      "HD video quality",
      "Priority access",
      "No download restrictions",
    ],
  },
];

function Subscription() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {

      const response = await getProfile();

      if (response.data.success) {
        setUser(response.data.user);
      }

    } catch (error) {

      console.error(error);

    }
  };

  const handleUpgrade = async () => {

    try {

      setLoading(true);

      const response = await upgradePlan();

      if (response.data.success) {

        alert("Premium activated successfully!");

        fetchUser();

      }

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Upgrade failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      <div className="text-center mb-12">

        <h1 className="text-4xl font-bold">
          Choose Your Plan
        </h1>

        <p className="text-gray-400 mt-3">
          Upgrade your plan to unlock more downloads and premium content.
        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {plans.map((plan, index) => (

          <div
            key={index}
            className={`rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
            ${
              plan.name === "Premium"
                ? "bg-gray-900 border-blue-500 hover:shadow-blue-500/30"
                : "bg-gray-900 border-gray-800 hover:border-gray-600"
            }`}
          >

            <div className="flex items-center justify-between">

              <h2 className="text-3xl font-bold">
                {plan.name}
              </h2>

              {plan.name === "Premium" && (
                <Crown
                  size={28}
                  className="text-yellow-500"
                />
              )}

            </div>

            <h3 className="text-5xl font-bold mt-6">
              {plan.price}
            </h3>

            <div className="flex items-center gap-2 mt-5 text-blue-400">

              <Download size={18} />

              <span>
                {plan.downloads}
              </span>

            </div>

            <ul className="mt-8 space-y-4">

              {plan.features.map((feature, i) => (

                <li
                  key={i}
                  className="flex items-center gap-3 text-gray-300"
                >

                  <Check
                    size={18}
                    className="text-green-500"
                  />

                  {feature}

                </li>

              ))}

            </ul>

            <div className="mt-10">

              {plan.name === "Free" ? (

                <Button
                  variant="secondary"
                  fullWidth
                >
                  Current Plan
                </Button>

              ) : (

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleUpgrade}
                  disabled={
                    loading ||
                    user?.plan === "Premium"
                  }
                >

                  {
                    user?.plan === "Premium"
                      ? "Current Plan"
                      : loading
                        ? "Upgrading..."
                        : "Upgrade Now"
                  }

                </Button>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Subscription;