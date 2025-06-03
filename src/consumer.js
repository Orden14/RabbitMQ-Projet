import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()
const RABBITMQ_URL = 'amqp://' + process.env.RABBITMQ_URL
const RESULT_QUEUE = 'calculation_results'

let channel

async function listen() {
    const connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()

    await channel.assertQueue(RESULT_QUEUE, {durable: true})
    await channel.consume(RESULT_QUEUE, consume)

    console.log('En écoute...')
}

function consume(message) {
    if (message !== null) {
        const result = JSON.parse(message.content.toString())

        console.log(`Résultat d'opération reçu : ${buildResultMessage(result)}`)

        channel.ack(message)
    }
}

function buildResultMessage(result) {
    let operationSymbol
    switch (result.operation) {
        case 'add':
            operationSymbol = '+'
            break
        case 'sub':
            operationSymbol = '-'
            break
        case 'mul':
            operationSymbol = '*'
            break
        case 'div':
            operationSymbol = '/'
            break
        default:
            operationSymbol = '?'
    }

    return `${result.firstNumber} ${operationSymbol} ${result.secondNumber} = ${result.result}`
}

listen().catch(console.error)
