(function () {
    const API_URL = "/Proxy/ForwardRequest";
    const CUSTOMER_API_URL = "/Proxy/FindCustomerDetails";

    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;

    class TxtType {
        constructor(el, toRotate, period) {
            this.toRotate = toRotate;
            this.el = el;
            this.loopNum = 0;
            this.period = parseInt(period, 10) || 2000;
            this.txt = '';
            this.tick();
            this.isDeleting = false;
        }

        tick() {
            const i = this.loopNum % this.toRotate.length;
            const fullTxt = this.toRotate[i];

            if (this.isDeleting) {
                this.txt = fullTxt.substring(0, this.txt.length - 1);
            } else {
                this.txt = fullTxt.substring(0, this.txt.length + 1);
            }

            this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;
            let delta = 200 - Math.random() * 100;

            if (this.isDeleting) {
                delta /= 2;
            }

            if (!this.isDeleting && this.txt === fullTxt) {
                delta = this.period;
                this.isDeleting = true;
            } else if (this.isDeleting && this.txt === '') {
                this.isDeleting = false;
                this.loopNum++;
                delta = 500;
            }

            setTimeout(() => this.tick(), delta);
        }
    }

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector("p");

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0613",
                messages: [
                    {
                        role: "system",
                        content: "You are a CRM solution expert. When a user asks about customer details, use the find_customer_by_email function to retrieve the information."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                functions: [
                    {
                        name: "find_customer_by_email",
                        description: "Find a customer's details by their email address",
                        parameters: {
                            type: "object",
                            properties: {
                                email: {
                                    type: "string",
                                    description: "The customer's email address"
                                }
                            },
                            required: ["email"]
                        }
                    }
                ],
                function_call: "auto"
            })
        };

        try {
            const res = await fetch(API_URL, requestOptions);
            const text = await res.text();

            console.log('Raw response:', text);

            const data = JSON.parse(text);

            if (data.choices && data.choices.length > 0) {
                const message = data.choices[0].message;

                if (message.function_call) {
                    const functionName = message.function_call.name;
                    const functionArgs = JSON.parse(message.function_call.arguments);

                    console.log('Function name:', functionName);
                    console.log('Function arguments:', functionArgs);

                    if (functionName === "find_customer_by_email") {
                        const customerData = await findCustomerDetails(functionArgs.email);
                        const response = `Customer details for ${functionArgs.email}:\n${JSON.stringify(customerData, null, 2)}`;
                        messageElement.textContent = response;
                    }
                } else {
                    messageElement.textContent = message.content.trim();
                }
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error('Error:', error);
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
        } finally {
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    };

    const findCustomerDetails = async (email) => {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer DywtH-cRW6SZdoRvNqsOPEaa2iat_7HEpg5B4BEC6i09x7giE56akcYb0e_xaMoZFxApfk9Cp6HikTQsctasDSsEck9LygLNiGB2wZSvj6LdDYf_pWLJdcyRIHvNK4fw-PU9maGtmAXyMzKV4cUbInFZamSsLydTyjmGQI0S86QeUzF9OR-igmlIswy2oNgmarsnaRtcxX-rN8_9merStYezLIlXJDaeVAjsABoBTv3kJhdVm9fYJyXGfybp0AqUWOQlTiu7gMM2ngiM648YLvBZp43-2seizXVnPDdOjxPCf99P2N5h0_TJyVhRHmVrJIbVmIxI3kHl-W1D1gPtznsAfd3wsv131LVffmpJLoC2bhBS"
            },
            body: JSON.stringify({
                SearchFilters: {
                    Email: email
                },
                ResponseFilters: {
                    LoyaltyDetails: true,
                    MarketingOptin: true,
                    Preferences: true
                },
                BrandID: 1
            })
        };

        const res = await fetch(CUSTOMER_API_URL, requestOptions);
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        return await res.json();
    };


    const handleChat = async () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        console.log('User message:', userMessage);

        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        await generateResponse(incomingChatLi);
    };

    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener("click", () => {
        console.log("Send button clicked");
        handleChat();
    });

    chatbotToggler.addEventListener("click", () => {
        console.log("Chatbot toggler clicked");
        document.body.classList.toggle("show-chatbot");
    });

    closeBtn.addEventListener("click", () => {
        console.log("Close button clicked");
        document.body.classList.remove("show-chatbot");
    });

    window.onload = function () {
        console.log("Window loaded");
        const elements = document.getElementsByClassName('typewrite');
        for (let i = 0; i < elements.length; i++) {
            const toRotate = elements[i].getAttribute('data-type');
            const period = elements[i].getAttribute('data-period');
            if (toRotate) {
                new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }

        const css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = '.typewrite > .wrap { border-right: 0.10em solid skyblue}';
        document.body.appendChild(css);
    };
})();
