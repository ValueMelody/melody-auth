import {
  PlusIcon, TrashIcon,
} from '@heroicons/react/16/solid'
import {
  Button, TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'

const RedirectUriEditor = ({
  redirectUris,
  onChange,
}: {
  redirectUris: string[];
  onChange: (uris: string[]) => void;
}) => {
  const t = useTranslations()

  const handleRemoveUri = (targetIndex: number) => {
    const newUris = redirectUris.filter((
      uri, index,
    ) => {
      return targetIndex !== index
    })
    onChange(newUris)
  }

  const handleUpdateUri = (
    targetIndex: number, value: string,
  ) => {
    const newUris = redirectUris.map((
      uri, index,
    ) => {
      return targetIndex === index ? value : uri
    })
    onChange(newUris)
  }

  const handleAddMoreUri = () => {
    onChange([...redirectUris, ''])
  }

  return (
    <>
      <section className='flex flex-col gap-4'>
        {
          redirectUris.map((
            uri, index,
          ) => (
            <section
              key={index}
              className='flex flex-col'
            >
              <section className='flex items-center gap-2 w-full'>
                <TextInput
                  onChange={(e) => handleUpdateUri(
                    index,
                    e.target.value,
                  )}
                  value={uri}
                  className='w-full'
                />
                <Button
                  color='gray'
                  onClick={() => handleRemoveUri(index)}
                  size='xs'
                >
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </section>
              <p className='mt-2'>{t('apps.urlFormat')}</p>
            </section>
          ))
        }
      </section>
      <Button
        onClick={handleAddMoreUri}
        className='mt-4'
        size='xs'
      >
        <PlusIcon className='w-4 h-4' />
      </Button>
    </>
  )
}

export default RedirectUriEditor
