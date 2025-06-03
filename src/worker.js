import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()
const AMQP_URL = 'amqp://' + process.env.RABBITMQ_URL
const EXCHANGE = 'calculation_operations'
const RESULT_QUEUE = 'calculation_results'

const OPERATION = process.argv[2] || 'add'
const QUEUE = `${OPERATION}_queue`
const ROUTING_KEY = `calc.${OPERATION}`

let channel

async function startWorker() {
    const connection = await amqp.connect(AMQP_URL)
    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE, 'topic', { durable: true })
    await channel.assertQueue(QUEUE, { durable: true })
    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY)
    await channel.assertQueue(RESULT_QUEUE, { durable: true })

    console.log(`Worker prêt pour ${OPERATION}`)

    await channel.consume(QUEUE, consume)
}

async function consume(message) {
    if (message !== null) {
        const task = JSON.parse(message.content.toString())
        const delay = Math.floor(Math.random() * 11) + 5

        const result = getResult(task)

        await new Promise((r) => setTimeout(r, delay))

        const response = {
            firstNumber: task.firstNumber,
            secondNumber: task.secondNumber,
            operation: OPERATION,
            result,
        }

        channel.sendToQueue(RESULT_QUEUE, Buffer.from(JSON.stringify(response)), {
            persistent: true,
        })

        channel.ack(message)
        console.log(`Résultat envoyé au consumer : ${response.result}`)
    }
}

function getResult(task) {
    let result
    switch (OPERATION) {
        case 'add':
            result = task.firstNumber + task.secondNumber
            break
        case 'sub':
            result = task.firstNumber - task.secondNumber
            break
        case 'mul':
            result = task.firstNumber * task.secondNumber
            break
        case 'div':
            result = task.secondNumber !== 0 ? task.firstNumber / task.secondNumber : null
            break
        default:
            result = null
    }

    return result
}

startWorker().catch(console.error)
