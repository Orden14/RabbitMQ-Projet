import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()
const AMQP_URL = 'amqp://' + process.env.RABBITMQ_URL
const EXCHANGE = 'calculation_operations'

const OPERATIONS = ['add', 'sub', 'mul', 'div']

async function produce() {
    let index = 0
    const connection = await amqp.connect(AMQP_URL)
    const channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE, 'topic', { durable: true })

    setInterval(async () => {
        let firstNumber = Math.floor(Math.random() * 100)
        let secondNumber = Math.floor(Math.random() * 100)
        let operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)]

        const message = JSON.stringify({ index, firstNumber, secondNumber, operation })
        index++

        const topicKey = `calc.${operation}`
        channel.publish(EXCHANGE, topicKey, Buffer.from(message))

        console.log(`Message envoyé : ${message}`)
    }, Math.floor(Math.random() * 1000) + 500)
}

produce().catch(console.error)
