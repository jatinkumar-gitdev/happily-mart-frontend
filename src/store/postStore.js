import { create } from "zustand";

const usePostStore = create((set) => ({
  // Modal state
  isCreatePostModalOpen: false,

  // Form state
  postFormData: {
    title: "",
    requirement: "",
    description: "",
    category: null,
    subcategory: null,
  },

  images: [],
  imagePreviews: [],

  // Actions
  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),

  closeCreatePostModal: () =>
    set({
      isCreatePostModalOpen: false,
      postFormData: {
        title: "",
        requirement: "",
        description: "",
        category: null,
        subcategory: null,
      },
      images: [],
      imagePreviews: [],
    }),

  updateFormData: (data) =>
    set((state) => ({
      postFormData: { ...state.postFormData, ...data },
    })),

  setImages: (images) => set({ images }),

  setImagePreviews: (previews) => set({ imagePreviews }),

  addImage: (image, preview) =>
    set((state) => ({
      images: [...state.images, image],
      imagePreviews: [...state.imagePreviews, preview],
    })),

  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
      imagePreviews: state.imagePreviews.filter((_, i) => i !== index),
    })),

  resetForm: () =>
    set({
      postFormData: {
        title: "",
        requirement: "",
        description: "",
        category: null,
        subcategory: null,
      },
      images: [],
      imagePreviews: [],
    }),
}));

export { usePostStore };
