import {
  Button,
  ButtonGroup,
  CellButton,
  Div,
  File,
  Group,
  Input,
  ModalCard,
  ModalRoot,
  Radio,
  ScreenSpinner,
  Title,
} from "@vkontakte/vkui";
import { useContext, useEffect, useRef, useState } from "react";
import { ModalIds } from "../model/views";
import { Locales } from "../locales/locales";
import { Room, Templates } from "../model/roomTemplate";
import { Icon24Camera } from "@vkontakte/icons";
import { uploadImage } from "../serverApi/serverApi";
import { AlertManagerContext, ErrorAlert } from "./contexts/AlertProvider";
export var ModalManager = null;

export default function Modals() {
  const joinRoomIdInputRef = useRef();
  const createRoomNameInputRef = useRef();
  const createChannelNameInputRef = useRef();
  const renameChannelNameInputRef = useRef();
  const alerts = useContext(AlertManagerContext)

  const [templateType, setTemplateType] = useState("empty");
  const [activeModal, setActiveModal] = useState(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("")
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);


  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
  
      // convertToBase64(uploadedFile, (imgBase64) => {
      //   console.log(imgBase64);
      // });
    }
  };

  function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.log('Error: ', error);
}
  
  const handleCreateTemplate = (name) => {
    const selectedTemplate = Templates[templateType]();
    selectedTemplate.setName(name);
    return selectedTemplate;
  };
  
  function findImageWithSize(images, width, height) {
    const image = images.find(img => img.width === width && img.height === height);
    return image.url; 
  }
  
  useEffect(() =>  {
    if (url) {
      const newRoom = handleCreateTemplate(createRoomNameInputRef.current.value);
      newRoom.setAvatar(url);
      activeModal.data.loadRoom(newRoom);
      onClose();
    }
  }, [url]);
 

  function resizeAndCropImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
  
        // Вычисляем начальные точки обрезки
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
  
        // Обрезаем и изменяем размер
        ctx.drawImage(img, startX, startY, size, size, 0, 0, 480, 480);
  
        // Получаем результат
        canvas.toBlob(callback, 'image/jpeg', 0.9);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }



async function  handleUploadImage() {
      setIsUploading(true)
      const blobImg = await new Promise((resolve, reject) => {
        resizeAndCropImage(file, (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Ошибка обработки изображения'));
          }
        })
      })
      const formData = new FormData();
      formData.append('image', blobImg);
      await uploadImage(formData)
        .then((response) => {
          const imageUrl = findImageWithSize(response.Images, 160, 160);
          setUrl(imageUrl)
        })
        .catch((error) => {
          alerts.showAlert(
            ErrorAlert({
              message: "не удалось создать комнату",
              alertManager: alerts,
            })
          )
          console.log("ошибка получения фотокарточки")
        })
        .finally(() => {
          setIsUploading(false);
        })
    };
  
  const handleTemplateChange = (e) => {
    setTemplateType(e.target.value);
  };

  ModalManager = {
    showModal: function (id, data) {
      setActiveModal({ id: id, data: data });
    },
  };

  const onClose = function () {
    setActiveModal(null);
  };

  return (
    <ModalRoot  activeModal={activeModal?.id}>
      <ModalCard
        id={ModalIds.JoinRoom}
        header={Locales.Modals.JoinRoom.Header}
        onClose={onClose}
      >
        <Group
          style={{
            paddingTop: 10,
            paddingLeft: 15,
            paddingRight: 15,
          }}
        >
          <Input
            placeholder={Locales.Modals.JoinRoom.InputPlaceHolder}
            type="text"
            getRef={joinRoomIdInputRef}
          />
          <Button
            style={{
              marginTop: 15,
            }}
            size="l"
            mode="primary"
            stretched
            onClick={() => {
              onClose();
              activeModal.data.loadRoom(joinRoomIdInputRef.current.value);
            }}
          >
            {Locales.Modals.JoinRoom.JoinButton}
          </Button>
        </Group>
      </ModalCard>

      <ModalCard
        id={ModalIds.CreateRoom}
        header={Locales.Modals.CreateRoom.Header}
        onClose={onClose}
      >
        <Group>
          <Input
            type="text"
            placeholder={Locales.Modals.CreateRoom.NameInputPlaceHolder}
            getRef={createRoomNameInputRef}
            disabled={isUploading}
            style={{ marginTop: "8px", marginBottom: "16px" }}
          />
  <Div style={{ display: 'flex', alignItems: 'center' }}>
    <File
      top="Загрузите картинку"
      before={<Icon24Camera/>} 
      style={{ marginBottom: "5px" }}
      accept="image/jpeg, image/png, image/heic, image/svg, image/jpg, image/ico, image/tiff, image/heif"
      onChange={handleFileChange}
      disabled={isUploading}
    />
      <div style={{
    marginLeft: '5px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '150px' 
  }}>{fileName}</div>
  </Div>
          <Radio
            name="template"
            value="empty"
            disabled={isUploading}
            checked={templateType === "empty"}
            onChange={handleTemplateChange}
            style={{ marginBottom: "8px" }}
          >
            {Locales.Modals.CreateRoom.clearTemplate}
          </Radio>
          <Radio
            name="template"
            value="default"
            disabled={isUploading}
            checked={templateType === "default"}
            onChange={handleTemplateChange}
            style={{ marginBottom: "8px" }}
          >
            {Locales.Modals.CreateRoom.defaultTemplate}
          </Radio>

          <Button
            style={{
              marginTop: 15,
            }}
            size="l"
            mode="primary"
            stretched
            disabled={isUploading}
            onClick={ async () => {
              if (file) {
                await handleUploadImage()
                setFileName("")
              }
              else {
                const newRoom = handleCreateTemplate(createRoomNameInputRef.current.value);  
                activeModal.data.loadRoom(newRoom);
                onClose();
                setFileName("")
              }
              setFile(null);
            }}
          >
            {Locales.Modals.CreateRoom.CreateButton}
          </Button>
        </Group>
      </ModalCard>

      <ModalCard
        id={ModalIds.CreateChannel}
        header={Locales.Modals.CreateChannel.Header}
        onClose={onClose}
      >
        <Group>
          <Input
            type="text"
            getRef={createChannelNameInputRef}
            placeholder={Locales.Modals.CreateChannel.NameInputPlaceHolder}
            style={{ marginTop: "8px", marginBottom: "16px" }}
          />

          <Button
            style={{
              marginTop: 15,
            }}
            size="l"
            mode="primary"
            stretched
            onClick={() => {
              onClose();
              activeModal.data.createChannel(createChannelNameInputRef.current.value)
            }}
          >
            {Locales.Modals.CreateRoom.CreateButton}
          </Button>
        </Group>
      </ModalCard>

      <ModalCard
        id={ModalIds.RenameChannel}
        header={Locales.Modals.RenameChannel.Header}
        onClose={onClose}
      >
        <Group>
          <Input
            type="text"
            getRef={renameChannelNameInputRef}
            placeholder={Locales.Modals.RenameChannel.NameInputPlaceHolder}
            style={{ marginTop: "8px", marginBottom: "16px" }}
          />

          <Button
            style={{
              marginTop: 15,
            }}
            size="l"
            mode="primary"
            stretched
            onClick={() => {
              onClose();
              const channelId = activeModal.data.renameChannelId;
              activeModal.data.renameChannel(
                renameChannelNameInputRef.current.value,
                channelId)
            }}
          >
            {Locales.Modals.RenameChannel.renameButton}
          </Button>
        </Group>
      </ModalCard>

      
    </ModalRoot>
  );
}
