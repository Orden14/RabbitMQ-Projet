import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()
const AMQP_URL = 'amqp://' + process.env.RABBITMQ_URL
const EXCHANGE = 'calculation_operations'

const OPERATIONS = ['add', 'sub', 'mul', 'div', 'all']
const ROUTING_KEYS = ['calc.add', 'calc.sub', 'calc.mul', 'calc.div']

async function produce() {
    let indexRef = { value: 0 }
    const connection = await amqp.connect(AMQP_URL)
    const channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true })

    const [, , opArg, firstArg, secondArg] = process.argv

    if (opArg && OPERATIONS.includes(opArg)) {
        await handleManualMode(channel, indexRef.value++, opArg, firstArg, secondArg)
        await channel.close()
        await connection.close()

        return
    }

    await handleRandomMode(channel, indexRef)
}

async function handleManualMode(channel, index, opArg, firstArg, secondArg) {
    const firstNumber = firstArg ? parseInt(firstArg, 10) : Math.floor(Math.random() * 100)
    const secondNumber = secondArg ? parseInt(secondArg, 10) : Math.floor(Math.random() * 100)
    const message = createMessage(index, firstNumber, secondNumber, opArg)

    await sendMessage(channel, opArg, message)
}

async function handleRandomMode(channel, indexRef) {
    setInterval(async () => {
        const firstNumber = Math.floor(Math.random() * 100)
        const secondNumber = Math.floor(Math.random() * 100)
        const operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)]
        const message = createMessage(indexRef.value++, firstNumber, secondNumber, operation)

        await sendMessage(channel, operation, message)
    }, Math.floor(Math.random() * 2000) + 3000)
}

function createMessage(index, firstNumber, secondNumber, operation) {
    return JSON.stringify({ index, firstNumber, secondNumber, operation })
}

export async function sendMessage(channel, operation, message) {
    if (operation === 'all') {
        ROUTING_KEYS.forEach(routingKey => {
            channel.publish(EXCHANGE, routingKey, Buffer.from(message))
        })
        console.log(`Message envoyé (all) : ${message} -> ${ROUTING_KEYS.join(', ')}`)
    } else {
        const topicKey = `calc.${operation}`
        channel.publish(EXCHANGE, topicKey, Buffer.from(message))
        console.log(`Message envoyé : ${message}`)
    }
}

produce().catch(console.error)
