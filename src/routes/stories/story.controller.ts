import { Request, Response } from "express";
import { omit } from "../../helpers";
import { JwtPayload } from "../../types/ap";
import StoryRepo from "./story.repo";

export const fetchProjectStories = async (req: Request, res: Response) => {
    const { projectID } = req.params
    const { keyword, page, status, type } = req.query as any
    res.status(200).json(await StoryRepo.getStoriesByProjectIdAndPage(projectID, page, keyword, status, type))
}

export const upsertProjectStory = async (req: Request, res: Response) => {
    const { title, type, points, description, owner_ids } = req.body
    const { projectID, storyID } = req.params
    const { user_id } = req.user as JwtPayload
    let story = {}

    if (projectID) // POST --> /projects/:projectID/stories
        story = await StoryRepo.createStory({ title, type, points, description, project: { project_id: projectID }, creator: { user_id } }, owner_ids)
    if (storyID) // PUT --> /stories/:storyID
        story = await StoryRepo.findByIdAndUpdate(storyID, { title, type, points, description })
    res.status(200).json(omit(story, ['created_at', 'project']))
}

export const setStoryStatus = async (req: Request, res: Response) => {
    const { status } = req.body
    const { storyID } = req.params
    res.status(204).json(await StoryRepo.findByIdAndSetStatus(storyID, status))
}

export const addStoryOwner = async (req: Request, res: Response) => {
    const { storyID } = req.params
    const { owner_id } = req.body
    res.status(200).json(await StoryRepo.addStoryOwner(storyID, owner_id))
}

export const removeStoryOwner = async (req: Request, res: Response) => {
    const { storyID, ownerID } = req.params
    res.status(204).json(await StoryRepo.removeStoryOwner(storyID, ownerID))
}
