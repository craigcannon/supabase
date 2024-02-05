import { DatabaseConnectionString } from 'components/interfaces/Settings/Database/DatabaseSettings/DatabaseConnectionString'
import { Plug } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  DialogContent_Shadcn_,
  DialogDescription_Shadcn_,
  DialogFooter_Shadcn_,
  DialogClose_Shadcn_,
  DialogHeader_Shadcn_,
  DialogTitle_Shadcn_,
  DialogTrigger_Shadcn_,
  Dialog_Shadcn_,
  IconExternalLink,
  TabsContent_Shadcn_,
  TabsList_Shadcn_,
  TabsTrigger_Shadcn_,
  Tabs_Shadcn_,
} from 'ui'
import { CONNECTION_TYPES, ConnectionType, FRAMEWORKS, ORMS } from './Connect.constants'
import ConnectDropdown from './ConnectDropdown'

import { PermissionAction } from '@supabase/shared-types/out/constants'

import { useParams } from 'common/hooks'

import { useProjectApiQuery } from 'data/config/project-api-query'
import { useProjectSettingsQuery } from 'data/config/project-settings-query'
import { useCheckPermissions } from 'hooks'
import { DEFAULT_PROJECT_API_SERVICE_ID } from 'lib/constants'
import Link from 'next/link'
import { projectKeys } from './Connect.types'
import ConnectTabContent from './ConnectTabContent'
import { PoolingModesModal } from 'components/interfaces/Settings/Database/PoolingModesModal'

type GetContentFilesArgs = {
  selectedParent: string
  selectedChild: string
  selectedGrandchild: string
  connectionObject: ConnectionType[]
}
// const getContentFiles = ({
//   connectionObject,
//   selectedParent,
//   selectedChild,
//   selectedGrandchild,
// }: GetContentFilesArgs) => {
//   const parent = connectionObject.find((item) => item.key === selectedParent)

//   if (parent) {
//     const child = parent.children.find((child) => child.key === selectedChild)

//     // check grandchild first, then child, then parent as the fallback
//     if (child) {
//       const grandchild = child.children.find((grandchild) => grandchild.key === selectedGrandchild)

//       if (grandchild) {
//         return grandchild.files || []
//       } else {
//         return child.files || []
//       }
//     } else {
//       return parent.files || []
//     }
//   }

//   return []
// }

const getContentFilePath = ({
  connectionObject,
  selectedParent,
  selectedChild,
  selectedGrandchild,
}: GetContentFilesArgs) => {
  const parent = connectionObject.find((item) => item.key === selectedParent)

  if (parent) {
    const child = parent.children.find((child) => child.key === selectedChild)

    // check grandchild first, then child, then parent as the fallback
    if (child) {
      const grandchild = child.children.find((grandchild) => grandchild.key === selectedGrandchild)

      if (grandchild) {
        return `${selectedParent}/${selectedChild}/${selectedGrandchild}`
      } else {
        return `${selectedParent}/${selectedChild}`
      }
    } else {
      return selectedParent
    }
  }

  return ''
}
const Connect = () => {
  const { ref: projectRef } = useParams()

  const [parentSelectorOpen, setParentSelectorOpen] = useState(false)
  const [childDropdownOpen, setChildDropdownOpen] = useState(false)
  const [grandChildDropdownOpen, setGrandChildDropdownOpen] = useState(false)
  const [connectionObject, setConnectionObject] = useState<ConnectionType[]>(FRAMEWORKS)
  const [selectedParent, setSelectedParent] = useState(connectionObject[0].key) // aka nextjs
  const [selectedChild, setSelectedChild] = useState(
    connectionObject.find((item) => item.key === selectedParent)?.children[0]?.key ?? ''
  )
  const [selectedGrandchild, setSelectedGrandchild] = useState(
    FRAMEWORKS.find((item) => item.key === selectedParent)?.children.find(
      (child) => child.key === selectedChild
    )?.children[0]?.key || ''
  )

  // const [contentFiles, setContentFiles] = useState(
  //   connectionObject
  //     .find((item) => item.key === selectedParent)
  //     ?.children.find((child) => child.key === selectedChild)
  //     ?.children.find((grandchild) => grandchild.key === selectedGrandchild)?.files || []
  // )
  console.log(selectedParent, selectedChild, selectedGrandchild)
  // set the content files when the parent/child/grandchild changes
  // useEffect(() => {
  //   const files = getContentFiles({
  //     connectionObject,
  //     selectedParent,
  //     selectedChild,
  //     selectedGrandchild,
  //   })
  //   //setContentFiles(files)
  // }, [selectedParent, selectedChild, selectedGrandchild, connectionObject])

  const handleParentChange = (value: string) => {
    setSelectedParent(value)

    // check if parent has children
    setSelectedChild(connectionObject.find((item) => item.key === value)?.children[0]?.key ?? '')

    // check if child has grandchildren
    setSelectedGrandchild(
      connectionObject.find((item) => item.key === value)?.children[0]?.children[0]?.key ?? ''
    )
  }

  const handleChildChange = (value: string) => {
    setSelectedChild(value)

    const parent = connectionObject.find((item) => item.key === selectedParent)
    const child = parent?.children.find((child) => child.key === value)

    if (child && child.children.length > 0) {
      setSelectedGrandchild(child.children[0].key)
    } else {
      setSelectedGrandchild('')
    }
  }

  const handleGrandchildChange = (value: string) => {
    setSelectedGrandchild(value)
  }

  // reset the parent/child/grandchild when the connection type (tab) changes
  function handleConnectionTypeChange(connections: ConnectionType[]) {
    setSelectedParent(connections[0].key)

    if (connections[0]?.children.length > 0) {
      setSelectedChild(connections[0].children[0].key)

      if (connections[0].children[0]?.children.length > 0) {
        setSelectedGrandchild(connections[0].children[0].children[0].key)
      } else {
        setSelectedGrandchild('')
      }
    } else {
      setSelectedChild('')
      setSelectedGrandchild('')
    }
  }

  function handleConnectionType(type: string) {
    if (type === 'frameworks') {
      setConnectionObject(FRAMEWORKS)
      handleConnectionTypeChange(FRAMEWORKS)
    }

    if (type === 'orms') {
      setConnectionObject(ORMS)
      handleConnectionTypeChange(ORMS)
    }

    // if (type === 'graphql') {
    //   setConnectionObject(GRAPHQL)
    //   handleConnectionTypeChange(GRAPHQL)
    // }
  }

  const getChildOptions = () => {
    const parent = connectionObject.find((item) => item.key === selectedParent)
    if (parent && parent.children.length > 0) {
      return parent.children
    }
    return []
  }

  const getGrandchildrenOptions = () => {
    const parent = connectionObject.find((item) => item.key === selectedParent)
    const subCategory = parent?.children.find((child) => child.key === selectedChild)
    if (subCategory && subCategory.children.length > 0) {
      return subCategory.children
    }
    return []
  }

  const { data: projectSettings } = useProjectSettingsQuery({ projectRef })

  const { data: apiSettings } = useProjectApiQuery({
    projectRef,
  })

  // Get the API service
  const apiService = (projectSettings?.services ?? []).find(
    (x: any) => x.app.id == DEFAULT_PROJECT_API_SERVICE_ID
  )

  const canReadAPIKeys = useCheckPermissions(PermissionAction.READ, 'service_api_keys')

  // Get the API service
  const apiHost = canReadAPIKeys
    ? `${apiSettings?.autoApiService?.protocol ?? 'https'}://${
        apiSettings?.autoApiService?.endpoint ?? '-'
      }`
    : ''
  const apiUrl = canReadAPIKeys ? apiHost : null

  const anonKey = canReadAPIKeys
    ? apiService?.service_api_keys.find((key) => key.tags === 'anon')?.api_key ?? null
    : null

  const projectKeys = { apiUrl, anonKey }

  const filePath = getContentFilePath({
    connectionObject,
    selectedParent,
    selectedChild,
    selectedGrandchild,
  })

  return (
    <>
      <div>
        <Dialog_Shadcn_>
          <DialogTrigger_Shadcn_ asChild>
            <Button type="default">
              <span className="flex items-center gap-2">
                <Plug size={12} className="rotate-90" /> <span>Connect</span>
              </span>
            </Button>
          </DialogTrigger_Shadcn_>
          <DialogContent_Shadcn_ className="sm:max-w-5xl">
            <DialogHeader_Shadcn_>
              <DialogTitle_Shadcn_>Connect to your project</DialogTitle_Shadcn_>
              <DialogDescription_Shadcn_>
                Get the connection strings and environment variables for your app
              </DialogDescription_Shadcn_>
            </DialogHeader_Shadcn_>

            <Tabs_Shadcn_
              defaultValue="direct"
              onValueChange={(value) => handleConnectionType(value)}
            >
              <TabsList_Shadcn_>
                <TabsTrigger_Shadcn_ key="direct" value="direct">
                  Direct Connection
                </TabsTrigger_Shadcn_>
                {CONNECTION_TYPES.map((type) => (
                  <TabsTrigger_Shadcn_ key={type.key} value={type.key}>
                    {type.label}
                  </TabsTrigger_Shadcn_>
                ))}
              </TabsList_Shadcn_>

              {CONNECTION_TYPES.map((type) => (
                <TabsContent_Shadcn_ key={`content-${type.key}`} value={type.key}>
                  <div className="p-3">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        {/* all parents */}
                        <ConnectDropdown
                          level="parent"
                          open={parentSelectorOpen}
                          setOpen={setParentSelectorOpen}
                          state={selectedParent}
                          updateState={handleParentChange}
                          label={connectionObject === FRAMEWORKS ? 'Framework' : 'Tool'}
                          items={connectionObject}
                        />
                        {/* children of those parents */}
                        {selectedParent &&
                          (connectionObject.find((parent) => parent.key === selectedParent)
                            ?.children.length || 0) > 0 && (
                            <ConnectDropdown
                              level="child"
                              open={childDropdownOpen}
                              setOpen={setChildDropdownOpen}
                              state={selectedChild}
                              updateState={handleChildChange}
                              label="Using"
                              items={getChildOptions()}
                            />
                          )}
                        {/* grandchildren if any */}
                        {selectedChild &&
                          (connectionObject
                            .find((parent) => parent.key === selectedParent)
                            ?.children.find((child) => child.key === selectedChild)?.children
                            .length || 0) > 0 && (
                            <ConnectDropdown
                              level="grandchild"
                              open={grandChildDropdownOpen}
                              setOpen={setGrandChildDropdownOpen}
                              state={selectedGrandchild}
                              updateState={handleGrandchildChange}
                              label="With"
                              items={getGrandchildrenOptions()}
                            />
                          )}
                      </div>
                      {connectionObject.find((item) => item.key === selectedParent)?.guideLink && (
                        <Button
                          asChild
                          type="default"
                          icon={<IconExternalLink size={14} strokeWidth={1.5} />}
                        >
                          <Link
                            href={
                              connectionObject.find((item) => item.key === selectedParent)
                                ?.guideLink || ''
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {connectionObject.find((item) => item.key === selectedParent)?.label}{' '}
                            guide
                          </Link>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-foreground-lighter my-3">
                      Add the following files below to your application
                    </p>
                    <ConnectTabsContent projectKeys={projectKeys} filePath={filePath} />
                  </div>
                </TabsContent_Shadcn_>
              ))}
              <TabsContent_Shadcn_ key="direct" value="direct">
                <DatabaseConnectionString />
              </TabsContent_Shadcn_>
            </Tabs_Shadcn_>

            <DialogFooter_Shadcn_>
              <DialogClose_Shadcn_>
                <Button type="secondary">Close</Button>
              </DialogClose_Shadcn_>
            </DialogFooter_Shadcn_>
          </DialogContent_Shadcn_>
        </Dialog_Shadcn_>
      </div>
      <PoolingModesModal />
    </>
  )
}

interface ConnectTabsContentProps {
  filePath: string
  projectKeys: projectKeys
}

const ConnectTabsContent = ({ filePath, projectKeys }: ConnectTabsContentProps) => {
  // Crappy hack to get the tabs to re-render when the defaultValue changes
  // I can't figure out why it doesn't re-render with the correct tab selected - jordi
  // const [syncedDefaultValue, setSyncedDefaultValue] = useState(defaultValue)
  // const filePath = useEffect(() => {
  //   setSyncedDefaultValue(defaultValue)
  // }, [defaultValue])

  return (
    <div className=" border rounded-lg mt-4">
      <ConnectTabContent projectKeys={projectKeys} filePath={filePath} />
    </div>
  )
}

export default Connect
