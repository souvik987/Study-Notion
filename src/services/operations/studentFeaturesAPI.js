import toast from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice"
import {resetCart} from "../../slices/cartSlice";


const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }
        document.body.appendChild(script);
    })
}

export async function  buyCourse(token, courses, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");
    try {
        // load the script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
       // console.log("res", res);
        if(!res){
            toast.error("Razorpay SDK failed to load");
            return;
        }

        //initiate the order
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,  
                                                 {courses},
                                                 {
                                                    Authorization: `Bearer ${token}`,
                                                 })
        if(!orderResponse.data.success) {
            throw new Error(orderResponse.data.message);
        }
        console.log("BUY COURSE RESPONSE.....", orderResponse);
        // options
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            currency: orderResponse.data.message?.currency,
            amount: `${orderResponse.data.message.amount}`,
            order_id: orderResponse.data?.message.id,
            name: "StudyNotion",
            description: "Thank you for purchasing the course.",
            image: rzpLogo,
            prefill: {
                name: `${userDetails.firstName} ${userDetails.lastName}`,
                email: userDetails.email,
            },
            handler: function(response) {
                console.log("Buy Course -> response", response);
                //send successful mail
                sendPaymentSuccessfulEmail(response, orderResponse.data.amount, token);
                //verify payment
                verifyPayment({...response, courses}, token, navigate, dispatch);
            }
        }
        console.log("options: ", options);

        const paymentObject = new window.Razorpay(options);
        //console.log("PaymentObject", paymentObject);
        paymentObject.open();
        paymentObject.on("Payment.failed", function(response) {
            toast.error("oops, payment failed");
            console.log(response.error);
        }) 

    } catch (error) {
        console.log("PAYMENT API ERROR....", error);
        toast.error("Could not make payment");
    }
    toast.dismiss();
}

async function sendPaymentSuccessfulEmail(response, amount, token) {
    try {
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        })
    } catch (error) {
       console.log("PAYMENT SUCCESS EMAIL ERROR...", error); 
    }
}

// verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    //console.log("token in verify payment: ", token);
    dispatch(setPaymentLoading(true));
    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData,{
            Authorization: `Bearer ${token}`,
        })
        console.log("Response Data in verify payment: ", response);
        if(!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Payment Successful, you are added to the course.");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    } catch (error) {
        console.log("Payment verify error...", error);
        toast.error("Could not verify payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}