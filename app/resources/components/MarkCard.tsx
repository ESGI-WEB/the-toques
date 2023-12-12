"use client";
import React from 'react';
import {Card, CardContent, Typography, Rating} from '@mui/material';
import {Mark} from "@/app/resources/models/recipe.model";

export default function MarkCard({mark}: { mark: Mark }) {
    return (
        <Card>
            <CardContent>
                <Rating value={mark.mark} readOnly/>
                <Typography variant="h3">{mark.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {mark.content}
                </Typography>
                <div className="flex flex-wrap flex-space-between gap-10">
                    <Typography variant="body2" color="text.secondary">
                        {mark.user.firstName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {new Date(mark.createdAt).toLocaleDateString()}
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};