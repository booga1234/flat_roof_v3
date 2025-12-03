import { useState } from 'react'
import NewPage from '../components/NewPage'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import ContactSelect from '../components/ContactSelect'
import Modal from '../components/Modal'
import Popup from '../components/Popup'
import SearchPanel from '../components/SearchPanel'

function Proposals() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [page, setPage] = useState('search')

  return (
    <NewPage>
      <PageHeader text="Proposals" />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex gap-4">
          <ContactSelect />
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
                  <h2
                    className="font-inter font-semibold"
                    style={{
                      fontSize: '24px',
                      color: '#282828',
                      letterSpacing: '-0.01em',
                    }}
                  >
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

