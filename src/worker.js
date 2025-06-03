import amqp from 'amqplib'
import dotenv from 'dotenv'


dotenv.config()
const AMQP_URL = 'amqp://' + process.env.RABBITMQ_URL

const QUEUE = 'add_queue'
const EXCHANGE = 'calculation_operations'
const RESULT_QUEUE = 'calculation_results'

let channel


async function startWorker(){
    const connection = await amqp.connect(AMQP_URL)
    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE, 'topic', { durable: true })
    await channel.assertQueue(QUEUE, { durable: true })

    await channel.bindQueue(QUEUE, EXCHANGE, 'calc.add')
    await channel.assertQueue(RESULT_QUEUE, { durable: true })

    console.log("Worker prêt pour additions")

    await channel.consume(QUEUE, consume)
}

async function consume(message){
    if (message !== null){
        console.log('')
        const task = JSON.parse(message.content.toString())
        const delay = Math.floor(Math.random() * 11) + 5

        console.log(`Message reçu, addition de ${task.firstNumber} + ${task.secondNumber}`)
        await new Promise((r) => setTimeout(r, delay))

        const response = {
            firstNumber: task.firstNumber,
            secondNumber: task.secondNumber,
            operation: 'add',
            result: task.firstNumber + task.secondNumber,
        }

        channel.sendToQueue(RESULT_QUEUE, Buffer.from(JSON.stringify(response)), {
            persistent: true,
        })

        channel.ack(message)
        console.log(`Résultat envoyé au consumer : ${response.result}`)
    }
}

startWorker().catch(console.error)
