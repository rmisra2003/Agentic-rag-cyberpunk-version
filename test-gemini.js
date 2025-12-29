const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCcb7-iH_0VRE-o1FZRHf0FBJA8sNMUuiA");

async function listAllModels() {
    // This might fail if listModels isn't exposed on the client directly this way without admin SDK
    // But let's try to verify if we can list them.
    // actually the node SDK doesn't always expose listModels easily on the client instance 
    // without strict setup.
    // Let's rely on the error message which usually lists available models if 404... 
    // actually the error message said "Call ListModels to see the list..."

    console.log("Trying gemini-1.5-flash-8b...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash-8b:", result.response.text());
    } catch (e) {
        console.log("Error with gemini-1.5-flash-8b:", e.message);
    }
}

listAllModels();
