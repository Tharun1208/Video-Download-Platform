import React, { useEffect, useState } from "react";
import {
  Check,
  Crown,
  Download,
  ShieldCheck,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../components/common/Button";
import ConfirmationModal from "../components/common/ConfirmationModal";
import toast from "react-hot-toast";
import { getProfile } from "../api/userApi";
import {
  createOrder,
  verifyPayment,
} from "../api/subscriptionApi";

// =========================================================
// PLANS
// =========================================================

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    downloads: "1 Video / Day",
    description: "Perfect for getting started",
    features: [
      "Watch free videos",
      "1 download per day",
      "Basic video quality",
      "Download history",
    ],
  },
  {
    name: "Bronze",
    price: "₹99",
    period: "/ month",
    downloads: "5 Videos / Day",
    description: "For regular video downloads",
    features: [
      "5 downloads per day",
      "HD video quality",
      "Faster downloads",
      "Basic premium videos",
    ],
  },
  {
    name: "Silver",
    price: "₹199",
    period: "/ month",
    downloads: "15 Videos / Day",
    description: "Best value for active users",
    recommended: true,
    features: [
      "15 downloads per day",
      "Full premium videos",
      "High quality downloads",
      "Priority support",
      "No ads",
    ],
  },
  {
    name: "Gold",
    price: "₹399",
    period: "/ month",
    downloads: "Unlimited",
    description: "The ultimate StreamVault experience",
    features: [
      "Unlimited downloads",
      "4K video quality",
      "No ads",
      "Early access features",
      "VIP support",
    ],
  },
];

// =========================================================
// COMPONENT
// =========================================================

function Subscription() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [upgradeConfirmPlan, setUpgradeConfirmPlan] = useState(null);

  // =======================================================
  // FETCH USER
  // =======================================================

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setProfileLoading(true);

      const response = await getProfile();

      console.log("PROFILE RESPONSE:", response.data);

      if (response?.data?.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // =======================================================
  // GET CURRENT PLAN
  // =======================================================

  const getCurrentPlan = () => {
    const plan =
      user?.plan ||
      user?.subscriptionPlan ||
      user?.subscription?.plan ||
      "Free";

    const normalizedPlan = String(plan)
      .trim()
      .toLowerCase();

    if (normalizedPlan === "bronze") {
      return "Bronze";
    }

    if (normalizedPlan === "silver") {
      return "Silver";
    }

    if (normalizedPlan === "gold") {
      return "Gold";
    }

    return "Free";
  };

  const currentPlan = getCurrentPlan();

  // =======================================================
  // CURRENT PLAN DETAILS
  // =======================================================

  const currentPlanDetails =
    plans.find(
      (plan) => plan.name === currentPlan
    ) || plans[0];

  // =======================================================
  // HANDLE UPGRADE
  // =======================================================

  const requestUpgrade = (planName) => {
    setUpgradeConfirmPlan(planName);
  };

  const handleUpgrade = async (planName) => {
    setUpgradeConfirmPlan(null);
    try {
      setLoading(true);

      console.log("=================================");
      console.log("Selected plan:", planName);
      console.log("Creating Razorpay order...");
      console.log("=================================");

      const orderResponse = await createOrder({
        plan: planName,
      });

      console.log(
        "Create order response:",
        orderResponse.data
      );

      if (!orderResponse.data.success) {
        throw new Error(
          orderResponse.data.message ||
            "Unable to create payment order"
        );
      }

      const { order } = orderResponse.data;

      if (!order || !order.id) {
        throw new Error(
          "Razorpay order was not created"
        );
      }

      console.log("Razorpay order:", order);

      if (!window.Razorpay) {
        toast.error(
          "Razorpay SDK is not loaded. Please refresh the page."
        );

        setLoading(false);
        return;
      }

      const options = {
        key:
          orderResponse.data?.key ||
          import.meta.env.VITE_RAZORPAY_KEY_ID ||
          "rzp_test_TI7z5n7Yo0DASb",

        amount: order.amount,

        currency: order.currency || "INR",

        name: "StreamVault",

        description: `${planName} Subscription Upgrade`,

        order_id: order.id,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          try {
            console.log("=================================");
            console.log(
              "Razorpay payment successful"
            );
            console.log(
              "Razorpay response:",
              response
            );
            console.log("=================================");

            const verifyResponse =
              await verifyPayment({
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                plan: planName,
              });

            console.log(
              "Payment verification response:",
              verifyResponse.data
            );

            if (verifyResponse.data.success) {
              toast.success(
                `${planName} plan activated successfully! Check your email for invoice details.`,
                { duration: 6000 }
              );

              await fetchUser();
            } else {
              toast.error(
                verifyResponse.data.message ||
                  "Payment verification failed"
              );
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            toast.error(
              error.response?.data?.message ||
                error.response?.data?.error ||
                "Payment verification failed"
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay payment popup closed"
            );

            setLoading(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          toast.error(
            response.error?.description ||
              "Payment failed"
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "================================="
      );

      console.error("PAYMENT ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Payment failed"
      );

      setLoading(false);
    }
  };

  // =========================================================
  // PLAN STYLE
  // =========================================================

  const getPlanStyle = (planName) => {
    switch (planName) {
      case "Bronze":
        return {
          iconBg:
            "bg-orange-500/10 border-orange-500/20",
          icon: "text-orange-500",
          accent:
            "from-orange-500/10 to-transparent",
        };

      case "Silver":
        return {
          iconBg:
            "bg-blue-500/10 border-blue-500/20",
          icon: "text-blue-500",
          accent:
            "from-blue-500/10 to-transparent",
        };

      case "Gold":
        return {
          iconBg:
            "bg-yellow-500/10 border-yellow-500/20",
          icon: "text-yellow-500",
          accent:
            "from-yellow-500/10 to-transparent",
        };

      default:
        return {
          iconBg:
            "bg-gray-500/10 border-gray-500/20",
          icon: "theme-text-muted",
          accent:
            "from-gray-500/10 to-transparent",
        };
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (profileLoading) {
    return (
      <div
        className="
          min-h-screen
          theme-bg
          theme-text
          flex
          items-center
          justify-center
          px-4
          transition-colors
          duration-500
        "
      >
        <div className="text-center">

          <div
            className="
              w-12
              h-12
              mx-auto
              rounded-full
              border-4
              border-blue-500
              border-t-transparent
              animate-spin
            "
          />

          <p
            className="
              mt-5
              theme-text-secondary
              text-sm
            "
          >
            Loading subscription...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        transition-colors
        duration-500
      "
    >

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header
        className="
          border-b
          theme-border
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
            sm:py-10
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <div>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl
                  font-extrabold
                  tracking-tight
                "
              >
                Subscription
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  sm:text-base
                  theme-text-secondary
                  max-w-2xl
                "
              >
                Choose the plan that best fits
                your video watching and download
                needs.
              </p>

            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
          sm:py-10
          lg:py-14
        "
      >

        {/* ===================================================
            CURRENT PLAN
        =================================================== */}

        <section
          className="
            max-w-5xl
            mx-auto
            mb-10
            sm:mb-12
          "
        >

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              theme-card
              border
              theme-border
              shadow-lg
              transition-all
              duration-500
            "
          >

            {/* TOP ACCENT */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-1
                bg-gradient-to-r
                from-blue-500
                via-indigo-500
                to-purple-500
              "
            />

            <div
              className="
                p-5
                sm:p-6
                lg:p-7
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-6
              "
            >

              {/* LEFT */}

              <div
                className="
                  flex
                  items-start
                  sm:items-center
                  gap-4
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    sm:w-14
                    sm:h-14
                    shrink-0
                    rounded-2xl
                    bg-blue-500/10
                    border
                    border-blue-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Crown
                    size={27}
                    className="text-blue-500"
                  />
                </div>

                <div className="min-w-0">

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      font-semibold
                      theme-text-muted
                    "
                  >
                    Your current plan
                  </p>

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      sm:gap-3
                      mt-1
                    "
                  >

                    <h2
                      className="
                        text-2xl
                        sm:text-3xl
                        font-bold
                      "
                    >
                      {currentPlan}
                    </h2>

                    <span
                      className="
                        px-2.5
                        py-1
                        rounded-full
                        bg-green-500/10
                        border
                        border-green-500/20
                        text-green-500
                        text-xs
                        font-semibold
                      "
                    >
                      Active
                    </span>

                  </div>

                  <p
                    className="
                      mt-1
                      text-sm
                      theme-text-secondary
                    "
                  >
                    {currentPlanDetails.downloads}
                  </p>

                </div>

              </div>

              {/* RIGHT */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  theme-bg
                  border
                  theme-border
                  px-4
                  py-3
                  w-full
                  md:w-auto
                "
              >

                <Download
                  size={19}
                  className="text-blue-500 shrink-0"
                />

                <div>

                  <p
                    className="
                      text-xs
                      theme-text-muted
                    "
                  >
                    Download allowance
                  </p>

                  <p
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    {currentPlanDetails.downloads}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            PLAN HEADER
        =================================================== */}

        <section className="text-center mb-8 sm:mb-9">

          <h2
            className="
              text-2xl
              sm:text-3xl
              font-bold
            "
          >
            Compare Plans
          </h2>

          <p
            className="
              mt-2
              theme-text-secondary
              text-sm
              sm:text-base
            "
          >
            Pick the plan that gives you
            exactly what you need.
          </p>

        </section>

        {/* ===================================================
            PLAN CARDS
        =================================================== */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-5
            lg:gap-6
            items-stretch
          "
        >

          {plans.map((plan, index) => {
            const isCurrentPlan =
              plan.name === currentPlan;

            const style =
              getPlanStyle(plan.name);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                whileHover={{ y: -8 }}
                transition={{
                  duration: 0.45,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: index * 0.08,
                }}
                className={`
                  relative
                  flex
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  theme-card
                  border
                  theme-border
                  shadow-md
                  transition-colors
                  duration-300
                  ${
                    isCurrentPlan
                      ? "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10"
                      : ""
                  }
                  hover:shadow-2xl
                  hover:border-blue-500/60
                `}
              >

                {/* CARD ACCENT */}

                <div
                  className={`
                    absolute
                    inset-x-0
                    top-0
                    h-28
                    bg-gradient-to-b
                    ${style.accent}
                    pointer-events-none
                  `}
                />

                {/* CURRENT BADGE */}

                {isCurrentPlan && (
                  <div
                    className="
                      absolute
                      top-4
                      right-4
                      z-10
                      flex
                      items-center
                      gap-1.5
                      px-2.5
                      py-1
                      rounded-full
                      bg-green-500/10
                      border
                      border-green-500/20
                      text-green-500
                      text-[10px]
                      font-bold
                      tracking-wide
                    "
                  >
                    <Check size={12} />
                    CURRENT
                  </div>
                )}

                {/* RECOMMENDED BADGE */}

                {plan.recommended &&
                  !isCurrentPlan && (
                    <div
                      className="
                        absolute
                        top-4
                        right-4
                        z-10
                        flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        rounded-full
                        bg-blue-500/10
                        border
                        border-blue-500/20
                        text-blue-500
                        text-[10px]
                        font-bold
                        tracking-wide
                      "
                    >
                      <Star
                        size={12}
                        fill="currentColor"
                      />
                      BEST VALUE
                    </div>
                  )}

                {/* CARD CONTENT */}

                <div
                  className="
                    relative
                    flex
                    flex-col
                    h-full
                    p-5
                    sm:p-6
                  "
                >

                  {/* PLAN ICON */}

                  <div
                    className={`
                      w-12
                      h-12
                      rounded-xl
                      border
                      flex
                      items-center
                      justify-center
                      ${style.iconBg}
                    `}
                  >
                    {plan.name === "Free" ? (
                      <Download
                        size={22}
                        className={style.icon}
                      />
                    ) : (
                      <Crown
                        size={23}
                        className={style.icon}
                      />
                    )}
                  </div>

                  {/* PLAN NAME */}

                  <div className="mt-5">

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-widest
                        font-semibold
                        theme-text-muted
                      "
                    >
                      StreamVault
                    </p>

                    <h3
                      className="
                        mt-1
                        text-2xl
                        font-bold
                      "
                    >
                      {plan.name}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        theme-text-secondary
                        min-h-[40px]
                      "
                    >
                      {plan.description}
                    </p>

                  </div>

                  {/* PRICE */}

                  <div
                    className="
                      mt-6
                      pb-5
                      border-b
                      theme-border
                    "
                  >

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold theme-text-muted">
                        {plan.price.startsWith("₹") ? "₹" : ""}
                      </span>

                      <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                        {plan.price.replace("₹", "")}
                      </span>

                      {plan.period && (
                        <span className="ml-1 text-sm font-medium theme-text-muted">
                          {plan.period}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* DOWNLOAD LIMIT */}

                  <div
                    className="
                      mt-5
                      rounded-xl
                      theme-bg
                      border
                      theme-border
                      p-3.5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <div
                        className="
                          w-9
                          h-9
                          shrink-0
                          rounded-lg
                          bg-blue-500/10
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Download
                          size={17}
                          className="text-blue-500"
                        />
                      </div>

                      <div>

                        <p
                          className="
                            text-[11px]
                            theme-text-muted
                          "
                        >
                          Daily allowance
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-sm
                            font-semibold
                          "
                        >
                          {plan.downloads}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* FEATURES */}

                  <div className="mt-6 flex-1">

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-wider
                        font-bold
                        theme-text-muted
                        mb-4
                      "
                    >
                      Includes
                    </p>

                    <ul className="space-y-3">

                      {plan.features.map(
                        (feature, i) => (
                          <li
                            key={i}
                            className="
                              flex
                              items-start
                              gap-2.5
                              text-sm
                              theme-text-secondary
                            "
                          >

                            <span
                              className="
                                mt-0.5
                                w-5
                                h-5
                                shrink-0
                                rounded-full
                                bg-green-500/10
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <Check
                                size={12}
                                className="text-green-500"
                              />
                            </span>

                            <span>
                              {feature}
                            </span>

                          </li>
                        )
                      )}

                    </ul>

                  </div>

                  {/* BUTTON */}

                  <div className="mt-7">

                    {isCurrentPlan ? (
                      <Button
                        variant="secondary"
                        fullWidth
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : plan.name === "Free" ? (
                      <Button
                        variant="secondary"
                        fullWidth
                        disabled
                      >
                        Free Plan
                      </Button>
                    ) : (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          requestUpgrade(
                            plan.name
                          )
                        }
                        className="
                          w-full
                          py-3
                          px-4
                          rounded-xl
                          font-semibold
                          text-sm
                          bg-blue-600
                          text-white
                          transition-all
                          duration-300
                          hover:bg-blue-500
                          hover:-translate-y-0.5
                          hover:shadow-lg
                          hover:shadow-blue-500/20
                          active:translate-y-0
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          disabled:hover:translate-y-0
                        "
                      >
                        {loading
                          ? "Processing..."
                          : `Upgrade to ${plan.name}`}
                      </button>
                    )}

                  </div>
                </div>
              </motion.div>
            );
          })}

        </section>

        {/* ===================================================
            SECURITY
        =================================================== */}

        <section
          className="
            max-w-3xl
            mx-auto
            mt-10
            sm:mt-12
          "
        >

          <div
            className="
              theme-card
              border
              theme-border
              rounded-2xl
              px-5
              py-5
              sm:px-6
              transition-colors
              duration-500
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-center
                justify-center
                gap-4
                text-center
              "
            >

              <div
                className="
                  w-11
                  h-11
                  shrink-0
                  rounded-xl
                  bg-green-500/10
                  border
                  border-green-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <ShieldCheck
                  size={22}
                  className="text-green-500"
                />
              </div>

              <div>

                <p className="text-sm font-semibold">
                  Secure & trusted payments
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    sm:text-sm
                    theme-text-secondary
                  "
                >
                  Payments are securely
                  processed by{" "}
                  <span className="font-semibold theme-text">
                    Razorpay
                  </span>
                  . Your payment
                  information is protected.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* UPGRADE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={Boolean(upgradeConfirmPlan)}
        onClose={() => setUpgradeConfirmPlan(null)}
        onConfirm={() => handleUpgrade(upgradeConfirmPlan)}
        title="Upgrade Subscription?"
        message={`Are you sure you want to upgrade to the ${upgradeConfirmPlan} plan? You will proceed to the secure test checkout.`}
        confirmText="Proceed to Payment"
        cancelText="Cancel"
        type="primary"
        icon={Crown}
        loading={loading}
      />
    </div>
  );
}

export default Subscription;