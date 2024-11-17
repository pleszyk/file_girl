import filegirl from '../assets/banner.png'
import { useState, useEffect } from 'react'

function Home() {
  const words = ['Encryption', 'Privacy', 'Security'] // Array of words to cycle through
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const changeWord = () => {
    setFadeOut(true)
    setTimeout(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
      setFadeOut(false)
    }, 500) // Adjust the time as needed for the fade out and in
  }

  useEffect(() => {
    const interval = setInterval(() => {
      changeWord()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const cards = [
    {
      head: 'Create an Account',
      body: 'After signing up for a fileGirl account, you gain the ability to safeguard your files with encryption.',
    },
    {
      head: 'Encrypt Your Files',
      body: 'When you upload your files, you have the option to encrypt them. We employ AES-256 encryption, a highly secure algorithm, to ensure your data remains confidential.',
    },
    {
      head: 'Set a Passphrase',
      body: 'To encrypt your files, you\'ll set a passphrase. This passphrase serves as the key to unlock your encrypted files, so it\'s vital to remember it. For added security, we recommend writing it down and keeping it in a safe place.',
    },
    {
      head: 'Secure Downloads',
      body: 'When you need to download your encrypted files, our system will prompt you to enter the passphrase you\'ve previously set. This extra layer of security ensures that only authorized users can access your data.',
    },
    {
      head: 'Zero Knowledge',
      body: 'fileGirl does not, and will never, have access to your encryption passphrases. We don\'t store them on our servers. You are solely responsible for your passphrases, emphasizing the importance of keeping them secure.',
    },
    {
      head: 'Data Security',
      body: 'fileGirl is committed to maintaining the highest standards of data security, ensuring that your files remain confidential and accessible only to you. With our client-side encryption, you can trust that your information is in safe hands with fileGirl.',
    },
  ]

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="flex justify-center">
        <img
          alt={'logo'}
          src={filegirl}
          className="object-none rounded-xl h-[400px] w-full"
        />
        <div
          className={`absolute top-24 left-6 xl:left-72 lg:left-12 drop-shadow-2xl p-1 text-gray-200 text-5xl italic ${
            fadeOut ? 'fadeOut' : 'fadeIn'
          }`}
        >
          {words[currentWordIndex]} for Everyone
        </div>
      </div>
      <div className="text-white italic pt-0 p-4 px-10 text-4xl">
        {/* Storing your Files Securely with Encryption */}
        Keeping your Files Secure with Encryption
      </div>
      <div className="text-white italic text-lg flex items-center px-14 pb-5 justify-center">
        We prioritize your file security by implementing robust client-side
        encryption. This means that only you, and no one else, can access your
        files. Here&apos;s how our system works...
      </div>
      <div className="place-items-center lg:place-items-stretch grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-5 mb-5">
        {cards.map((card) => (
          <a key={card.head}
             className="h-full p-6  border rounded-lg shadow bg-gray-800 border-gray-700 hover:bg-gray-700">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
              {card.head}
            </h5>
            <p className="font-normal text-gray-400">{card.body}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Home
