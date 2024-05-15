// @ts-nocheck
import { useContext, useEffect, useMemo, useState } from 'react'
import fetch from 'node-fetch'
import useSWR from 'swr'
import { AppContext } from '../commands/index.js'
import { Octokit } from 'octokit'

export const useGetComponent = async () => {
  const { install, tokenStore } = useContext(AppContext)
  const { access_token } = tokenStore.get?.('token') ?? {}
  const [githubData, setGithubData] = useState(null)

  useEffect(() => {
    if (!access_token) return
    const octokit = new Octokit({
      auth: access_token,
    })

    const fetchGithubData = async () => {
      const { data } = await octokit.rest.users.getAuthenticated()
      setGithubData(data)
    }
    fetchGithubData()
  }, [access_token])

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.')
      error.info = await res.json()
      error.status = res.status
      throw error
    }
    const result = await res.text()
    return result
  }

  const codePath = useMemo(() => {
    // if (!installComponent) return "";
    // return `https://tamagui.dev/api/bento/code/${installComponent.category}/${installComponent.categorySection}/${installComponent.fileName}`;
    // return "https://tamagui.dev/api/bento/code/elements/tables/UsersTable"; //free
    // return "https://tamagui.dev/api/bento/code/elements/tables/Basic"; //paid
    return `http://localhost:5005/api/bento/code/${install.installingComponent?.category}/${install.installingComponent?.categorySection}/${install.installingComponent?.fileName}?userGithubId=${githubData?.node_id}` //paid
  }, [install, githubData])

  const { data, error, isLoading } = useSWR<string>(
    githubData?.id ? codePath : null,
    fetcher
  )

  return { data, error, isLoading }
}