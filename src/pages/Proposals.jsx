import { useState } from 'react'
import NewPage from '../components/NewPage'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import ContactSelect from '../components/ContactSelect'
import AddressSelect from '../components/AddressSelect'
import Modal from '../components/Modal'
import Popup from '../components/Popup'
import SearchPanel from '../components/SearchPanel'
import HelpText from '../components/HelpText'

function Proposals() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [page, setPage] = useState('search')

  return (
    <NewPage>
      <PageHeader text="Proposals" />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black">
            Proposal Information
          </h2>
          <HelpText text="This page allows you to manage and view all your proposals. You can create new proposals, edit existing ones, and track their status." />
        </div>
        <div className="flex gap-4">
          <ContactSelect />
          <AddressSelect />
          <Button onClick={() => setIsModalOpen(true)}>
            Test Modal
          </Button>
          <Button onClick={() => setIsPopupOpen(true)}>
            Test Popup
          </Button>
        </div>

        {/* Modal Test */}
        {isModalOpen && (
          <Modal
            title="Test Modal"
            onClose={() => setIsModalOpen(false)}
            backButton={page !== 'search' ? { onClick: () => setPage('search') } : undefined}
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="white" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" onClick={() => setIsModalOpen(false)}>
                  Save
                </Button>
              </div>
            }
            width="700px"
          >
            <Modal.Pages>
              {page === "search" && (
                <div key="search" className="modal-page-static flex flex-col">
                  <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black">
                    Select a contact
                  </h2>
                  <SearchPanel />
                </div>
              )}
              {page === "addContact" && (
                <div key="addContact" className="modal-page">
                  <PageHeader text="Add Contact Page" />
                </div>
              )}
              {page === "addProperty" && (
                <div key="addProperty" className="modal-page">
                  <PageHeader text="Add Property Page" />
                </div>
              )}
            </Modal.Pages>
          </Modal>
        )}

        {/* Popup Test */}
        {isPopupOpen && (
          <Popup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            maxWidth="600px"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Popup</h3>
              <p className="mb-4">This is a test of the existing Popup component.</p>
              <div className="flex justify-end gap-2">
                <Button variant="white" onClick={() => setIsPopupOpen(false)}>
                  Close
                </Button>
                <Button variant="dark" onClick={() => setIsPopupOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Popup>
        )}
      </div>
    </NewPage>
  )
}

export default Proposals

