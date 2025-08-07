import {
  useState, useCallback, useEffect,
} from 'hono/jsx'
import { routeConfig } from 'configs'
import { InitialProps } from 'pages/hooks'
import { parseResponse } from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'
import { bannerModel } from 'models'

export interface UseAppBannersProps {
  initialProps: InitialProps;
  params: AuthorizeParams;
}

const useAppBanners = ({
  initialProps,
  params,
}: UseAppBannersProps) => {
  const [appBanners, setAppBanners] = useState<bannerModel.Record[]>([])

  const fetchAppBanners = useCallback(
    () => {
      if (!initialProps.enableAppBanner) {
        return
      }

      fetch(
        `${routeConfig.IdentityRoute.AppBanners}?client_id=${params.clientId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(parseResponse)
        .then((response) => {
          const res = response as { banners: bannerModel.Record[] }
          setAppBanners(res.banners)
        })
    },
    [initialProps.enableAppBanner, params.clientId],
  )

  useEffect(
    () => {
      fetchAppBanners()
    },
    [fetchAppBanners],
  )

  return { appBanners }
}

export default useAppBanners
