
const sendOrder = async (event) => {
    console.log('Send Order was calling...');
    console.log(event);

    console.log(event.Records[0]);

}   


module.exports = {
    sendOrder
}